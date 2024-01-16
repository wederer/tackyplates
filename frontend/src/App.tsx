import React from 'react';
import { BrowserRouter, Link as RouterLink, Route, Routes } from "react-router-dom";
import './App.css';
import Experiments from './features/experiments/Experiments'
import Experiment from './features/experiment/Experiment'
import { AppBar, Container, Link, ThemeProvider, Toolbar, Typography } from '@mui/material'
import Testing from './features/Testing'
import { createTheme } from '@mui/material/styles'
import { deDE } from '@mui/x-data-grid'
import Running from './features/running/Running'
import NewExperiment from "./features/experiments/NewExperiment";

const theme = createTheme(
  {
    palette: {
      primary: {main: '#004A96'},
      secondary: {main: '#21A0D2'}
    },
  },
  deDE,
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AppBar position="static" sx={{mb: 2}}>
          <Toolbar>
            <Typography variant="h6" component="div">
              <Link component={RouterLink} to={'/'} color="inherit" underline="none">TackyPlates</Link>
            </Typography>
          </Toolbar>
        </AppBar>
        <Container>
          <Routes>
            <Route path="/" element={<Experiments/>}/>
            <Route path="/experiment/:experimentId" element={<Experiment/>}/>
            <Route path="/new" element={<NewExperiment/>}/>
            <Route path="/running" element={<Running/>}/>
            <Route path="/testing" element={<Testing/>}/>
          </Routes>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
