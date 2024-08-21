"use client";
import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  Box,
  Container,
  Paper,
  DialogActions,
  DialogContentText,
  DialogContent,
  TextField,
  Typography,
  Button,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  AppBar,
  Toolbar,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import { collection, writeBatch, setDoc, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/firebase";
import Head from 'next/head';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import mammoth from "mammoth";
import Tesseract from "tesseract.js";

const theme = createTheme({
  typography: {
    fontFamily: 'Aptos Black, sans-serif',
    h2: {
      fontFamily: 'Porkys, sans-serif',
      fontSize: '9.5rem',
    },
    h4: {
      fontSize: '3rem',
      fontWeight: 'bold',
    },
    h5: {
      fontSize: '5rem',
      color: '#E54792',
      fontWeight: 'bold',
    },
  },
  palette: {
    primary: {
      main: '#0F9ED5',
    },
    secondary: {
      main: '#E54792',
    },
    background: {
      default: '#E5F4FB',
    },
  },
  shape: {
    borderRadius: 2, 
  },
});

export default function Generate() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [numFlashcards, setNumFlashcards] = useState(10);
  const [answerType, setAnswerType] = useState("True or False");
  const [difficulty, setDifficulty] = useState("Medium");
  const [lang, setLang] = useState("English");
  const [inputType, setInputType] = useState("topic");
  const [file, setFile] = useState(null);
  const [recommendedTopic, setRecommendedTopic] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchRecommendedTopic();
    }
  }, [user]);

  const fetchRecommendedTopic = async () => {
    const userDocRef = doc(collection(db, "users"), user.id);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const collections = docSnap.data().flashcards || [];
      const topics = collections.map(col => col.name).join(", ");
      const response = await fetch(`/api/generate?topics=${encodeURIComponent(topics)}`);
      const data = await response.json();
      setRecommendedTopic(data.recommendedTopic);
    } else {
      const response = await fetch(`/api/generate?topics=`);
      const data = await response.json();
      setRecommendedTopic(data.recommendedTopic);
    }
  };

  const extractTextFromWord = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const extractTextFromImage = async (file) => {
    const result = await Tesseract.recognize(file, 'eng');
    return result.data.text;
  };

  const handleSubmit = async () => {
    let inputData = text;
    let fileType = null;

    if (inputType !== "topic" && file) {
      if (inputType === "word") {
        inputData = await extractTextFromWord(file);
      } else if (inputType === "image") {
        inputData = await extractTextFromImage(file);
      } 
      fileType = inputType;
    }

    fetch("/api/generate", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: inputData, lang, numFlashcards, difficulty, answerType, fileType }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.flashcards) {
          setFlashcards(data.flashcards);
        } else {
          console.error('Error:', data.error);
        }
      });
  };

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const saveFlashcard = async () => {
    if (!name) {
      alert("Please enter a name");
      return;
    }

    const batch = writeBatch(db);
    const userDocRef = doc(collection(db, "users"), user.id);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const collections = docSnap.data().flashcards || [];
      if (collections.find((f) => f.name === name)) {
        alert("Flashcard collection with the same name already exists.");
        return;
      } else {
        collections.push({ name });
        batch.set(userDocRef, { flashcards: collections }, { merge: true });
      }
    } else {
      batch.set(userDocRef, { flashcards: [{ name }] });
    }

    const colRef = collection(userDocRef, name);
    flashcards.forEach((flashcard) => {
      const cardDocRef = doc(colRef);
      batch.set(cardDocRef, flashcard);
    });

    await batch.commit();
    handleClose();
    router.push(`/flashcards?id=${name}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: '#E5F4FB', minHeight: '100vh' }}>
        <Container maxWidth="100vw" sx={{ p: 0 }}>
          <Head>
            <title>Memoraize - Generate Flashcards</title>
            <meta name="description" content="Generate flashcards using AI" />
            <link rel="icon" href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><text x='8' y='48' font-family='Porkys' font-size='48' fill='%230F9ED5'>M</text><text x='32' y='48' font-family='Porkys' font-size='48' fill='%23E54792'>M</text></svg>" />
          </Head>
          <AppBar position="static" color="transparent" elevation={0}>
            <Toolbar>
              <Button
                onClick={() => router.push('/')}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  mt: 2,
                  ml: 2,
                  padding: 0,
                  minWidth: 'auto',
                  height: 'auto',
                  fontFamily: "Porkys, sans-serif",
                  fontSize: '2.5rem',
                  textTransform: 'none',
                  color: '#0F9ED5',
                  ':after': {
                    content: '"M"',
                    display: 'inline-block',
                    fontFamily: 'Porkys, sans-serif',
                    fontSize: '2.5rem',
                    color: '#0F9ED5',
                    marginRight: '-0.5rem',
                  },
                  ':before': {
                    content: '"M"',
                    display: 'inline-block',
                    fontFamily: 'Porkys, sans-serif',
                    fontSize: '2.5rem',
                    color: '#E54792',
                  }
                }}
              />
              <Box sx={{ flexGrow: 1 }} />
              <SignedOut>
                <Button color="primary" variant="contained" href="/sign-in" sx={{ color: 'white', fontWeight: 'bold', borderRadius: 5 }}>
                  Log In
                </Button>
                <Button color="primary" variant="contained" href="/sign-up" sx={{ color: 'white', fontWeight: 'bold', borderRadius: 5, ml: 2 }}>
                  Sign Up
                </Button>
              </SignedOut>
              <SignedIn>
                <Button onClick={() => router.push('/flashcards')} variant="contained" sx={{ backgroundColor: '#E54792', color: 'white', fontWeight: 'bold', borderRadius: 5, mr: 2 }}>
                  Your Flashcards
                </Button>
                <UserButton />
              </SignedIn>
            </Toolbar>
          </AppBar>

          <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
            <Box
              sx={{
                mt: 6, 
                mb: 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: '80vh', 
              }}
            >
              <Typography variant="h4" sx={{ color: '#E54792', fontWeight: 'bold', mb: 3 }}>
                Generate Flashcards
              </Typography>
              {recommendedTopic && (
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#0F9ED5', fontWeight: 'bold', mr: 2 }}>
                    Recommended Topic:
                  </Typography>
                  <Button variant="contained" sx={{ backgroundColor: '#E54792', color: 'white', fontWeight: 'bold', borderRadius: 5 }} onClick={fetchRecommendedTopic}>
                    {recommendedTopic}
                  </Button>
                </Box>
              )}
              <Paper sx={{
                p: 4,
                width: "100%",
                maxWidth: '800px', 
                borderRadius: 8, 
                backgroundColor: '#0F9ED5',
                boxShadow: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <FormControl component="fieldset" sx={{ mb: 3, border: '2px solid #E54792', borderRadius: 2, p: 2 }}>
                  <FormLabel component="legend" sx={{ color: '#000000', fontWeight: 'bold' }}>Input Type</FormLabel>
                  <RadioGroup
                    row
                    value={inputType}
                    onChange={(e) => setInputType(e.target.value)}
                  >
                    <FormControlLabel value="topic" control={<Radio />} label="Type a Topic" />
                    <FormControlLabel value="word" control={<Radio />} label="Upload Word Document" />
                    <FormControlLabel value="image" control={<Radio />} label="Upload Image" />
                  </RadioGroup>
                </FormControl>

                {inputType === "topic" ? (
                  <TextField
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    label="Enter text"
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    sx={{
                      mb: 3, 
                      backgroundColor: '#E5F4FB', 
                      '& .MuiOutlinedInput-root': { borderRadius: 2 },
                      '& .MuiInputLabel-root': { color: '#000' }
                    }}
                  />
                ) : (
                  <TextField
                    type="file"
                    fullWidth
                    variant="outlined"
                    onChange={(e) => setFile(e.target.files[0])}
                    sx={{
                      mb: 3, 
                      backgroundColor: '#E5F4FB', 
                      '& .MuiOutlinedInput-root': { borderRadius: 2 },
                      '& .MuiInputLabel-root': { color: '#000' }
                    }}
                  />
                )}

                <FormControl fullWidth sx={{ mb: 3 }}> 
                  <InputLabel sx={{ color: '#000' }}>Language</InputLabel>
                  <Select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    label="Language"
                    sx={{
                      backgroundColor: '#E5F4FB', 
                      '& .MuiOutlinedInput-root': { borderRadius: 8 },
                      '& .MuiInputLabel-root': { color: '#000' }
                    }}
                  >
                    <MenuItem value="Arabic">Arabic</MenuItem>
                    <MenuItem value="Assamese">Assamese</MenuItem>
                    <MenuItem value="Bengali">Bengali</MenuItem>
                    <MenuItem value="Chinese Mandarin">Chinese Mandarin</MenuItem>
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="French">French</MenuItem>
                    <MenuItem value="German">German</MenuItem>
                    <MenuItem value="Hindi">Hindi</MenuItem>
                    <MenuItem value="Italian">Italian</MenuItem>
                    <MenuItem value="Japanese">Japanese</MenuItem>
                    <MenuItem value="Korean">Korean</MenuItem>
                    <MenuItem value="Portuguese">Portuguese</MenuItem>
                    <MenuItem value="Russian">Russian</MenuItem>
                    <MenuItem value="Spanish">Spanish</MenuItem>
                    <MenuItem value="Tamil">Tamil</MenuItem>
                    <MenuItem value="Telugu">Telugu</MenuItem>
                    <MenuItem value="Urdu">Urdu</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel sx={{ color: '#000' }}>Number of Flashcards</InputLabel>
                  <Select
                    value={numFlashcards}
                    onChange={(e) => setNumFlashcards(e.target.value)}
                    label="Number of Flashcards"
                    sx={{
                      backgroundColor: '#E5F4FB',
                      '& .MuiOutlinedInput-root': { borderRadius: 8 },
                      '& .MuiInputLabel-root': { color: '#000' }
                    }}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={15}>15</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel sx={{ color: '#000' }}>Difficulty</InputLabel>
                  <Select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    label="Difficulty"
                    sx={{
                      backgroundColor: '#E5F4FB',
                      '& .MuiOutlinedInput-root': { borderRadius: 8 },
                      '& .MuiInputLabel-root': { color: '#000' }
                    }}
                  >
                    <MenuItem value="Easy">Easy</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Hard">Hard</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel sx={{ color: '#000' }}>Answer Type</InputLabel>
                  <Select
                    value={answerType}
                    onChange={(e) => setAnswerType(e.target.value)}
                    label="Answer Type"
                    sx={{
                      backgroundColor: '#E5F4FB',
                      '& .MuiOutlinedInput-root': { borderRadius: 8 },
                      '& .MuiInputLabel-root': { color: '#000' }
                    }}
                  >
                    <MenuItem value="True or False">True or False</MenuItem>
                    <MenuItem value="Multiple Choice">Multiple Choice</MenuItem>
                    <MenuItem value="Short Answer">Short Answer</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleSubmit}
                  sx={{ fontWeight: 'bold', borderRadius: 5 }}
                >
                  Generate Flashcards
                </Button>
              </Paper>
            </Box>

            {flashcards.length > 0 && (
              <Box sx={{ mt: 6 }}>
                <Typography variant="h4" sx={{ color: '#E54792', fontWeight: 'bold', mb: 3 }}>
                  Generated Flashcards
                </Typography>
                <Grid container spacing={3}>
                  {flashcards.map((flashcard, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card
                        onClick={() => handleCardClick(index)}
                        sx={{
                          backgroundColor: flipped[index] ? '#E54792' : '#0F9ED5',
                          color: '#fff',
                          borderRadius: 8,
                          boxShadow: 3,
                          cursor: 'pointer',
                          transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                          transition: 'transform 0.6s',
                          transformStyle: 'preserve-3d',
                        }}
                      >
                        <CardActionArea>
                          <CardContent sx={{ textAlign: 'center', p: 4 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {flipped[index] ? flashcard.back : flashcard.front}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleOpen}
                  sx={{ mt: 4, fontWeight: 'bold', borderRadius: 5 }}
                >
                  Save Flashcards
                </Button>
              </Box>
            )}

            <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Save Flashcards</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Please enter a name for your flashcard collection.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Collection Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{
                      backgroundColor: '#E5F4FB',
                      '& .MuiOutlinedInput-root': { borderRadius: 2 },
                      '& .MuiInputLabel-root': { color: '#000' }
                    }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={saveFlashcard} color="primary">
                    Save
                  </Button>
                </DialogActions>
              </Dialog>
            </Container>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }









