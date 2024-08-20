"use client";
import React, { useState } from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { AppBar, Box, Button, Container, Grid, Toolbar, Typography, Paper, Card, CardContent } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './styles/globals.css';

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
    background: {
      default: '#E5F4FB',
    },
  },
  shape: {
    borderRadius: 2,
  },
});

const features = [
  {
    title: 'Flashcard Organization',
    description1: 'Intuitive structure for users to manage their flashcards.',
    description2: 'Search bar to quickly find specific flashcards or sets. Enable categorization and tagging of flashcards for better organization.',
  },
  {
    title: 'AI-Powered Learning',
    description1: 'Implement AI-driven adaptive learning to enhance memorization.',
    description2: 'Use AI to track user performance and adjust the frequency of flashcard appearances. Implement spaced repetition algorithms to optimize learning schedules.',
  },
  {
    title: 'Calendar Integration',
    description1: 'Sync calendar events with flashcard revision notifications.',
    description2: 'Integrate a calendar feature for scheduling study sessions and setting reminders.',
  },
  {
    title: 'Analytics Dashboard',
    description1: 'Provide users with insights into their learning progress.',
    description2: 'Design a dashboard that displays key metrics such as time spent studying, quiz scores, and mastery levels. Include visual aids like graphs and charts to illustrate progress trends.',
  },
  {
    title: 'Multimedia Support',
    description1: 'Enhance the learning experience by supporting various media types.',
    description2: 'Enable users to upload and incorporate videos, PDFs, and audio into flashcards.',
  },
];

const pricingPlans = [
  {
    title: 'Basic',
    price: 'Free',
    features: ['Limited Flashcards', 'Limited Users', 'Basic Analytics', 'Community Support'],
  },
  {
    title: 'Pro',
    price: '$9.99/month',
    features: ['Unlimited Flashcards', 'Advanced Analytics', 'Priority Support', 'AI-Powered Learning'],
  },
  {
    title: 'Enterprise',
    price: 'Contact Us',
    features: ['Customized Solutions', 'Dedicated Support', 'Team Collaboration Tools', 'Advanced Security Features'],
  },
];

export default function Home() {
  const router = useRouter();
  const [flipped, setFlipped] = useState(Array(features.length).fill(false));

  const handleFlip = (index) => {
    setFlipped((prev) => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  const handleHomeClick = () => {
    router.push('/');
  };

  const getStarted = async () => {
    router.push('/generate');
  };

  const goToFlashcards = () => {
    router.push('/flashcards');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: '#E5F4FB', minHeight: '100vh' }}>
        <Container maxWidth="100vw" sx={{ p: 0 }}>
          <Head>
            <title>Memoraize</title>
            <meta name="description" content="Create flashcard from your text" />
            <link rel="icon" href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><text x='8' y='48' font-family='Porkys' font-size='48' fill='%230F9ED5'>M</text><text x='32' y='48' font-family='Porkys' font-size='48' fill='%23E54792'>M</text></svg>" />
          </Head>
          <AppBar position="static" color="transparent" elevation={0}>
            <Toolbar>
              <Button
                onClick={handleHomeClick}
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
                <Button onClick={goToFlashcards} variant="contained" sx={{ backgroundColor: '#E54792', color: 'white', fontWeight: 'bold', borderRadius: 5, mr: 2 }}>
                  Your Flashcards
                </Button>
                <UserButton />
              </SignedIn>
            </Toolbar>
          </AppBar>

          <Box
            sx={{
              textAlign: 'center',
              my: 4,
              backgroundColor: '#E5F4FB',
            }}
          >
            <Typography variant="h2" gutterBottom>
              <span style={{ color: '#E54792' }}>Memor</span>
              <span style={{ color: '#0F9ED5' }}>ai</span>
              <span style={{ color: '#E54792' }}>ze</span>
            </Typography>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ 
                color: '#0F9ED5', 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                mt: -8,
                mb: 2 
              }} 
            >
              Smart Learning, Effortless Memorizing!
            </Typography>
            <Button onClick={getStarted} variant="contained" sx={{ mt: 2, backgroundColor: '#E54792', fontWeight: 'bold', borderRadius: 5 }}>
              Get Started
            </Button>
          </Box>

        {/* Image Section */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 10 }}>
          <img src="/generate.png" alt="Generate" style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }} />
        </Box>

          <Box sx={{ my: 10, p: 1, backgroundColor: '#E5F4FB', borderRadius: 5, px: 4, boxShadow: 0 }}>
            <Typography textAlign="center" variant="h4" gutterBottom sx={{ color: '#0F9ED5', mb: 6, fontSize: '2.3rem', fontWeight: 'bold' }}>
              {Array.from("Features").map((letter, index) => (
                <span key={index} className="hover-letter">{letter}</span>
              ))}
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ position: 'relative', height: '300px', cursor: 'pointer' }} onClick={() => handleFlip(index)}>
                    <Paper
                      elevation={3}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: flipped[index] ? '#E54792' : '#0F9ED5',
                        borderRadius: 5,
                        transform: 'rotate(-3deg)',
                        transformOrigin: 'bottom left',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        textAlign: 'center',
                        fontSize: '1.2rem', 
                        overflowWrap: 'break-word', 
                        padding: '0 10px', 
                        fontWeight: 'bold', 
                      }}
                    >
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {flipped[index] ? feature.description2 : feature.description1}
                      </Typography>
                    </Paper>
                    <Paper
                      elevation={3}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: flipped[index] ? '#0F9ED5' : '#E54792',
                        borderRadius: 5,
                        transformOrigin: 'bottom left',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        textAlign: 'center',
                        fontWeight: 'bold', 
                      }}
                    >
                      <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
                        {feature.title}
                      </Typography>
                    </Paper>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Citation */}
          <Box sx={{ my: 10, px: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#E54792', fontSize: '2rem', fontWeight: 'bold', maxWidth: '800px', margin: '0 auto' }}>
              The best way to predict the future is to invent it. Empower your learning journey with our innovative flashcard solutions and make knowledge yours.            </Typography>
          </Box>

          {/* Pricing Section */}
          <Box sx={{ my: 10, py: 6, backgroundColor: '#E5F4FB', borderRadius: 5, px: 4, boxShadow: 0 }}>
            <Typography variant="h4" textAlign="center" gutterBottom sx={{ color: '#0F9ED5', mb: 6, fontSize: '2.3rem', fontWeight: 'bold' }}>
              {Array.from("Pricing").map((letter, index) => (
                <span key={index} className="hover-letter">{letter}</span>
              ))}
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              {pricingPlans.map((plan, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ backgroundColor: '#E54792', color: 'white', borderRadius: 5, height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" gutterBottom sx={{ color: 'white', fontWeight: 'bold', fontSize: '2rem' }}>
                        {plan.title}
                      </Typography>
                      <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
                        {plan.price}
                      </Typography>
                      <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {plan.features.map((feature, i) => (
                          <li key={i} style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{feature}</li>
                        ))}
                      </ul>
                      <Button variant="contained" sx={{ mt: 2, backgroundColor: '#0F9ED5', color: 'white', fontWeight: 'bold', borderRadius: 5 }}>
                        Choose Plan
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Footer Section */}
          <Box sx={{ backgroundColor: '#0F9ED5', py: 3, mt: 8, width: '100%', borderRadius: 10}}>
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              <a href="https://memoraize.vercel.app/" style={{ color: 'white', textDecoration: 'none', margin: '0 1rem' }}>MemorAIze</a>
              <a href="https://github.com/I2S9/MemorAIze" style={{ color: 'white', textDecoration: 'none', margin: '0 1rem' }}>GitHub</a>
              <a href="https://www.llamaindex.ai/" style={{ color: 'white', textDecoration: 'none', margin: '0 1rem' }}>Powered by Llama</a>
            </Typography>
          </Box>

        </Container>
      </Box>
    </ThemeProvider>
  );
}