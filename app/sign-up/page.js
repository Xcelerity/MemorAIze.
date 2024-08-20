"use client";

import { AppBar, Button, Toolbar, Typography, Container, Box } from "@mui/material";
import { SignUp } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Aptos Black, sans-serif',
    h4: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#E54792',
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

export default function SignUpPage() {
  const router = useRouter();

  const handleHomeClick = () => {
    router.push('/');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: '#E5F4FB', minHeight: '100vh' }}>
        <Container maxWidth="100vw" sx={{ p: 0 }}>
          <Head>
            <title>Sign Up</title>
            <meta name="description" content="Sign up for a new account" />
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
            </Toolbar>
          </AppBar>

          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: 'calc(100vh - 64px)', py: 4 }}
          >
            <Typography variant="h4" gutterBottom>
              Sign Up
            </Typography>
            <SignUp
              path="/sign-up"
              routing="path"
              signUpUrl="/sign-up"
              style={{ maxWidth: '400px', width: '100%' }}
            />
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                href="/sign-in"
                sx={{
                  backgroundColor: '#E54792',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: 5,
                  '&:hover': {
                    backgroundColor: '#d43f6c',
                  },
                }}
              >
                Sign In
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}