'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Container, Grid, Box, Typography, Card, CardActionArea, CardContent, AppBar, Toolbar, Button, TextField } from '@mui/material';
import { useSearchParams, useRouter } from 'next/navigation';

export default function Flashcards() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [collections, setCollections] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('name');
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
          return a.thematic.localeCompare(b.thematic);
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

  if (!isLoaded) {
    return <></>;
  }

  return (
    <Container maxWidth="lg" sx={{ backgroundColor: '#F0F4F8', minHeight: '100vh', padding: '2rem' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* MM Button at the top */}
          <Button
            onClick={() => router.push('/')}
            sx={{
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
          {!isSignedIn ? (
            <>
              <Button
                onClick={() => router.push('/sign-in')}
                color="primary"
                variant="contained"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: 20,
                  backgroundColor: '#E54792',
                  '&:hover': {
                    backgroundColor: '#C43C60',
                  },
                  mx: 1
                }}
              >
                Log In
              </Button>
              <Button
                onClick={() => router.push('/sign-up')}
                color="primary"
                variant="contained"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: 20,
                  backgroundColor: '#0F9ED5',
                  '&:hover': {
                    backgroundColor: '#0A8FD5',
                  },
                  mx: 1
                }}
              >
                Sign Up
              </Button>
            </>
          ) : (
            <Button
              onClick={() => { /* Handle Logout */ }}
              sx={{
                color: '#E54792',
                fontWeight: 'bold',
                borderRadius: 20,
                backgroundColor: 'white',
                border: '2px solid #E54792',
                '&:hover': {
                  backgroundColor: '#E54792',
                  color: 'white',
                },
                mx: 1
              }}
            >
              Log Out
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 4 }}>
        {!search ? (
          <>
            <Typography variant="h4" sx={{ color: '#E54792', fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
              Your Flashcard Collections 
            </Typography>
            {collections.length === 0 ? (
              <Typography variant="h6" sx={{ color: '#E54792', textAlign: 'center', mt: 4, fontWeight: 'bold' }}>
                No flashcards available, please create some.
              </Typography>
            ) : (
              <Grid container spacing={3} sx={{ mt: 4 }}>
                {collections.map((collection, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                      <CardActionArea onClick={() => handleCollectionClick(collection.name)}>
                        <CardContent>
                          <Typography variant="h5" component="div" sx={{ textAlign: 'center', color: '#0F9ED5' }}>
                            {collection.name}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        ) : (
          <Box sx={{ width: '100%', mb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Button
                onClick={() => setSortOrder('name')}
                sx={{ backgroundColor: '#0F9ED5', color: 'white', borderRadius: 20, mx: 1 }}
              >
                Sort by Name
              </Button>
              <Button
                onClick={() => setSortOrder('date')}
                sx={{ backgroundColor: '#0F9ED5', color: 'white', borderRadius: 20, mx: 1 }}
              >
                Sort by Date
              </Button>
              <Button
                onClick={() => setSortOrder('thematic')}
                sx={{ backgroundColor: '#0F9ED5', color: 'white', borderRadius: 20, mx: 1 }}
              >
                Sort by Thematic
              </Button>
              <TextField
                variant="outlined"
                placeholder="Search flashcards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 20 }, backgroundColor: '#0F9ED5', '& input': { color: 'white' }, mx: 1 }}
                InputProps={{ style: { borderRadius: 20, padding: '10px' } }}
              />
            </Box>
            <Grid container spacing={3} sx={{ mt: 4 }}>
              {flashcards.map((flashcard, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
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
                              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                              borderRadius: 2,
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
                              borderRadius: 2,
                            },
                            '& > div > div:nth-of-type(1)': {
                              backgroundColor: '#0F9ED5',
                              color: 'white',
                            },
                            '& > div > div:nth-of-type(2)': {
                              backgroundColor: '#E54792',
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
                            </div>
                            <div>
                              <Typography variant="h5" component="div">
                                {flashcard.back}
                              </Typography>
                            </div>
                          </div>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
}
