"use client";
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Container, Grid, Box, Typography, Card, CardActionArea, CardContent, AppBar, Toolbar, Button, TextField, IconButton, Menu, MenuItem, Switch, FormControlLabel, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useSearchParams, useRouter } from 'next/navigation';
import { CirclePicker } from 'react-color';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Flashcards() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [collections, setCollections] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('name');
  const [frontColor, setFrontColor] = useState('#0F9ED5');
  const [backColor, setBackColor] = useState('#E54792');
  const [anchorElSort, setAnchorElSort] = useState(null);
  const [anchorElColor, setAnchorElColor] = useState(null);
  const [audioMode, setAudioMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newFlashcard, setNewFlashcard] = useState({ front: '', back: '' });
  const [openCollectionDialog, setOpenCollectionDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const searchParams = useSearchParams();
  const search = searchParams.get('id');
  const router = useRouter();

  useEffect(() => {
    async function getCollections() {
      if (!user) {
        return;
      }
      const userDocRef = doc(collection(db, 'users'), user.id);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setCollections(data.flashcards || []);
      }
    }
    getCollections();
  }, [user]);

  useEffect(() => {
    async function getFlashcards() {
      if (!search || !user) {
        return;
      }
      const colRef = collection(doc(collection(db, 'users'), user.id), search);
      const docs = await getDocs(colRef);
      const flashcards = [];

      docs.forEach((doc) => {
        flashcards.push({ id: doc.id, ...doc.data() });
      });

      const filteredFlashcards = flashcards.filter(flashcard =>
        flashcard.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flashcard.back.toLowerCase().includes(searchQuery.toLowerCase())
      );

      filteredFlashcards.sort((a, b) => {
        if (sortOrder === 'date') {
          return a.date - b.date;
        } else if (sortOrder === 'thematic') {
          const thematicA = a.thematic || '';
          const thematicB = b.thematic || '';
          return thematicA.localeCompare(thematicB);
        } else {
          return a.front.localeCompare(b.front);
        }
      });

      setFlashcards(filteredFlashcards);
    }
    getFlashcards();
  }, [user, search, searchQuery, sortOrder]);

  const handleCollectionClick = (name) => {
    router.push(`/flashcards?id=${name}`);
  };

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleFrontColorChange = (color) => {
    setFrontColor(color.hex);
  };

  const handleBackColorChange = (color) => {
    setBackColor(color.hex);
  };

  const handleSortClick = (event) => {
    setAnchorElSort(event.currentTarget);
  };

  const handleCloseSort = () => {
    setAnchorElSort(null);
  };

  const handleColorClick = (event) => {
    setAnchorElColor(event.currentTarget);
  };

  const handleCloseColor = () => {
    setAnchorElColor(null);
  };

  const handleSortOptionClick = (option) => {
    setSortOrder(option);
    handleCloseSort();
  };

  const handleAudioToggle = () => {
    setAudioMode(!audioMode);
  };

  const handleDeleteModeToggle = () => {
    setDeleteMode(!deleteMode);
  };

  const handleAudioPlay = (text, event) => {
    event.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const handleDeleteFlashcard = async (flashcardId) => {
    if (!user || !search) {
      return;
    }

    try {
      const flashcardDocRef = doc(collection(doc(collection(db, 'users'), user.id), search), flashcardId);
      await deleteDoc(flashcardDocRef);
      setFlashcards((prev) => prev.filter((flashcard) => flashcard.id !== flashcardId));
    } catch (error) {
      console.error("Error deleting flashcard: ", error);
    }
  };

  const handleDeleteCollection = async (collectionName) => {
    if (!user) {
      return;
    }

    try {
      const userDocRef = doc(collection(db, 'users'), user.id);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const updatedCollections = data.flashcards.filter(col => col.name !== collectionName);

        await updateDoc(userDocRef, { flashcards: updatedCollections });
        setCollections(updatedCollections);
      }
    } catch (error) {
      console.error("Error deleting collection: ", error);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCreateFlashcard = async () => {
    if (!user || !search || !newFlashcard.front || !newFlashcard.back) {
      return;
    }

    try {
      const colRef = collection(doc(collection(db, 'users'), user.id), search);
      await addDoc(colRef, newFlashcard);
      setFlashcards((prev) => [...prev, newFlashcard]);
      setNewFlashcard({ front: '', back: '' });
      handleCloseDialog();
    } catch (error) {
      console.error("Error creating flashcard: ", error);
    }
  };

  const handleOpenCollectionDialog = () => {
    setOpenCollectionDialog(true);
  };

  const handleCloseCollectionDialog = () => {
    setOpenCollectionDialog(false);
  };

  const handleCreateCollection = async () => {
    if (!user || !newCollectionName) {
      return;
    }

    try {
      const userDocRef = doc(collection(db, 'users'), user.id);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const updatedCollections = [...data.flashcards, { name: newCollectionName }];

        await updateDoc(userDocRef, { flashcards: updatedCollections });
        setCollections(updatedCollections);
        setNewCollectionName('');
        handleCloseCollectionDialog();
      }
    } catch (error) {
      console.error("Error creating collection: ", error);
    }
  };

  if (!isLoaded) {
    return <></>;
  }

  return (
    <Container maxWidth="100vw" sx={{ backgroundColor: '#E5F4FB', minHeight: '100vh' }}>
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
          <Button onClick={() => router.push('/flashcards')} color="primary" variant="text" sx={{ color: '#0F9ED5', fontWeight: 'bold' }}>
            Your Flashcards
          </Button>
          {isSignedIn && (
            <IconButton onClick={() => router.push('/profile')}>
              <AccountCircleIcon sx={{ color: '#0F9ED5' }} />
            </IconButton>
          )}
          {!isSignedIn ? (
            <>
              <Button onClick={() => router.push('/sign-in')} color="primary" variant="contained" sx={{ color: 'white', fontWeight: 'bold', borderRadius: 5, ml: 2 }}>
                Log In
              </Button>
              <Button onClick={() => router.push('/sign-up')} color="primary" variant="contained" sx={{ color: 'white', fontWeight: 'bold', borderRadius: 5, ml: 2 }}>
                Sign Up
              </Button>
            </>
          ) : (
            <Button onClick={() => { /* Log out logic */ }} color="secondary" variant="contained" sx={{ color: 'white', backgroundColor: '#E54792', fontWeight: 'bold', borderRadius: 5, ml: 2 }}>
              Log Out
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 4, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!search ? (
          <>
            <Typography variant="h4" sx={{ color: '#E54792', fontWeight: 'bold', mb: 4 }}>
              Your Flashcards Collection
            </Typography>
            <Button
              onClick={() => router.push('/generate')}
              sx={{ mb: 4, backgroundColor: '#0F9ED5', color: 'white', fontWeight: 'bold', borderRadius: 2, ':hover': { backgroundColor: '#0D8CC7' } }}
              variant="contained"
              startIcon={<ArrowBackIcon />}
            >
              Back to Generate Flashcards
            </Button>
            {collections.length === 0 ? (
              <Typography variant="h6" sx={{ color: '#E54792', textAlign: 'center', mt: 4, fontWeight: 'bold' }}>
                No flashcards available, please create some.
              </Typography>
            ) : (
              <Grid container spacing={3} sx={{ mt: 4 }}>
                {collections.map((collection, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ boxShadow: 1, borderRadius: 2, position: 'relative' }}>
                      <CardActionArea onClick={() => handleCollectionClick(collection.name)}>
                        <CardContent>
                          <Typography variant="h5" component="div" sx={{ color: 'white', backgroundColor: '#E54792', padding: 6, borderRadius: 0 }}>
                            {collection.name}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                      <IconButton
                        sx={{ position: 'absolute', bottom: 8, right: 8 }}
                        onClick={() => handleDeleteCollection(collection.name)}
                      >
                        <DeleteIcon sx={{ color: '#FFFFFF' }} />
                      </IconButton>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            <Button
              onClick={handleOpenCollectionDialog}
              sx={{ mt: 4, backgroundColor: '#0F9ED5', color: 'white', fontWeight: 'bold', borderRadius: 2, ':hover': { backgroundColor: '#0D8CC7' } }}
              variant="contained"
            >
              Add Collection
            </Button>
          </>
        ) : (
          <Box sx={{ width: '100%', mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <TextField
                variant="outlined"
                placeholder="Search flashcards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    border: 'none',
                    backgroundColor: '#E5F4FB',
                  },
                  '& .MuiInputBase-input': {
                    padding: '10px',
                  },
                  flexGrow: 1,
                }}
                InputProps={{
                  endAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton onClick={handleSortClick}>
                        <ArrowDropDownIcon sx={{ color: '#0F9ED5' }} />
                      </IconButton>
                      <IconButton onClick={handleColorClick}>
                        <MoreVertIcon sx={{ color: '#0F9ED5' }} />
                      </IconButton>
                    </Box>
                  ),
                }}
              />
            </Box>
            <Menu
              anchorEl={anchorElSort}
              open={Boolean(anchorElSort)}
              onClose={handleCloseSort}
              PaperProps={{ sx: { width: 200 } }}
            >
              <MenuItem onClick={() => handleSortOptionClick('name')}>Sort by Name</MenuItem>
              <MenuItem onClick={() => handleSortOptionClick('date')}>Sort by Date</MenuItem>
              <MenuItem onClick={() => handleSortOptionClick('thematic')}>Sort by Thematic</MenuItem>
            </Menu>
            <Menu
              anchorEl={anchorElColor}
              open={Boolean(anchorElColor)}
              onClose={handleCloseColor}
              PaperProps={{ sx: { width: 300, padding: 2 } }}
            >
              <Typography variant="h6" sx={{ color: '#000', mb: 2 }}>Question Card Color</Typography>
              <CirclePicker color={frontColor} onChangeComplete={handleFrontColorChange} />
              <Typography variant="h6" sx={{ color: '#000', mt: 2, mb: 2 }}>Answer Card Color</Typography>
              <CirclePicker color={backColor} onChangeComplete={handleBackColorChange} />
              <Typography variant="h6" sx={{ color: '#000', mt: 2, mb: 2 }}>Audio Mode</Typography>
              <FormControlLabel
                control={<Switch checked={audioMode} onChange={handleAudioToggle} />}
                label="Toggle Audio"
              />
              <Typography variant="h6" sx={{ color: '#000', mt: 2, mb: 2 }}>Delete Mode</Typography>
              <FormControlLabel
                control={<Switch checked={deleteMode} onChange={handleDeleteModeToggle} />}
                label="Toggle Delete"
              />
            </Menu>
            <Grid container spacing={3} sx={{ mt: 4 }}>
              {flashcards.map((flashcard, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ boxShadow: 1, border: 'none', borderRadius: 2, position: 'relative' }}>
                    <CardActionArea onClick={() => handleCardClick(index)}>
                      <CardContent>
                        <Box
                          sx={{
                            perspective: '1000px',
                            '& > div': {
                              transition: 'transform 0.6s',
                              transformStyle: 'preserve-3d',
                              position: 'relative',
                              width: '100%',
                              height: '200px',
                              transform: flipped[index]
                                ? 'rotateY(180deg)'
                                : 'rotateY(0deg)',
                            },
                            '& > div > div': {
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              backfaceVisibility: 'hidden',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              padding: 2,
                              boxSizing: 'border-box',
                            },
                            '& > div > div:nth-of-type(1)': {
                              backgroundColor: frontColor,
                              color: 'white',
                            },
                            '& > div > div:nth-of-type(2)': {
                              backgroundColor: backColor,
                              color: 'white',
                              transform: 'rotateY(180deg)',
                            },
                          }}
                        >
                          <div>
                            <div>
                              <Typography variant="h5" component="div">
                                {flashcard.front}
                              </Typography>
                              {audioMode && (
                                <IconButton
                                  sx={{ position: 'absolute', bottom: 8, right: 8 }}
                                  onClick={(event) => handleAudioPlay(flashcard.front, event)}
                                >
                                  <VolumeUpIcon sx={{ color: 'white' }} />
                                </IconButton>
                              )}
                            </div>
                            <div>
                              <Typography variant="h5" component="div">
                                {flashcard.back}
                              </Typography>
                              {audioMode && (
                                <IconButton
                                  sx={{ position: 'absolute', bottom: 8, right: 8 }}
                                  onClick={(event) => handleAudioPlay(flashcard.back, event)}
                                >
                                  <VolumeUpIcon sx={{ color: 'white' }} />
                                </IconButton>
                              )}
                              </div>
                          </div>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                    {deleteMode && (
                      <IconButton
                        sx={{ position: 'absolute', bottom: 8, right: 8 }}
                        onClick={() => handleDeleteFlashcard(flashcard.id)}
                      >
                        <DeleteIcon sx={{ color: '#FFFFFF' }} />
                      </IconButton>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                onClick={handleOpenDialog}
                sx={{ backgroundColor: '#0F9ED5', color: 'white', fontWeight: 'bold', borderRadius: 2, ':hover': { backgroundColor: '#0D8CC7' } }}
                variant="contained"
              >
                Add Flashcard
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Flashcard</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the front and back text for the new flashcard.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Front"
            type="text"
            fullWidth
            variant="outlined"
            value={newFlashcard.front}
            onChange={(e) => setNewFlashcard({ ...newFlashcard, front: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Back"
            type="text"
            fullWidth
            variant="outlined"
            value={newFlashcard.back}
            onChange={(e) => setNewFlashcard({ ...newFlashcard, back: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateFlashcard} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCollectionDialog} onClose={handleCloseCollectionDialog}>
        <DialogTitle>Add New Collection</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the name for the new collection.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCollectionDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateCollection} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}



