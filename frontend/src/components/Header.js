import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Container, Button } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import GitHubIcon from '@mui/icons-material/GitHub';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TableChartIcon from '@mui/icons-material/TableChart';
import { colors } from '../App';

const Header = () => {
  const handleCSVExport = async () => {
    try {
      const response = await fetch('/api/exportCSV');
      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'cursor_conversations.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    }
  };

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Container>
        <Toolbar sx={{ p: { xs: 1, sm: 1.5 }, px: { xs: 1, sm: 0 } }}>
          <Box component={Link} to="/" sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none', 
            color: 'inherit',
            flexGrow: 1,
            '&:hover': {
              textDecoration: 'none'
            }
          }}>
            <ChatIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h5" component="div" fontWeight="700">
              Cursor View
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              component={Link}
              to="/batch-export"
              startIcon={<FileDownloadIcon />}
              variant="outlined"
              color="inherit"
              size="small"
              sx={{ 
                borderColor: 'rgba(255,255,255,0.5)', 
                color: 'white',
                '&:hover': { 
                  borderColor: 'rgba(255,255,255,0.8)',
                  backgroundColor: colors.highlightColor
                }
              }}
            >
              Export All
            </Button>
            <Button 
              onClick={handleCSVExport}
              startIcon={<TableChartIcon />}
              variant="outlined"
              color="inherit"
              size="small"
              sx={{ 
                borderColor: 'rgba(255,255,255,0.5)', 
                color: 'white',
                '&:hover': { 
                  borderColor: 'rgba(255,255,255,0.8)',
                  backgroundColor: colors.highlightColor
                }
              }}
            >
              Export as CSV
            </Button>
            <Button 
              component="a"
              href="https://github.com/saharmor/cursor-view"
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<GitHubIcon />}
              variant="outlined"
              color="inherit"
              size="small"
              sx={{ 
                borderColor: 'rgba(255,255,255,0.5)', 
                color: 'white',
                '&:hover': { 
                  borderColor: 'rgba(255,255,255,0.8)',
                  backgroundColor: colors.highlightColor
                }
              }}
            >
              GitHub
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 