import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  Button,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { colors } from '../App';

const BatchExport = () => {
  const [batchExportStatus, setBatchExportStatus] = useState(null);
  const [error, setError] = useState(null);

  const startBatchExport = async () => {
    try {
      setError(null);
      const response = await axios.post('/api/batchExport');
      const { batchSaveId } = response.data;
      setBatchExportStatus({ status: 'started' });
      pollBatchExportStatus(batchSaveId);
    } catch (err) {
      console.error('Error starting batch export:', err);
      setError('Failed to start batch export');
    }
  };

  const pollBatchExportStatus = async (batchId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/batchExportStatus?batchSaveId=${batchId}`);
        const status = response.data;
        setBatchExportStatus(status);
        
        if (status.status === 'finished' || status.status === 'failed') {
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Error polling batch export status:', err);
        clearInterval(pollInterval);
        setBatchExportStatus({ status: 'failed' });
        setError('Failed to get export status');
      }
    }, 2000);
  };

  const calculateProgress = () => {
    if (!batchExportStatus || !batchExportStatus.total_conversations || !batchExportStatus.saved_conversations) {
      return 0;
    }
    return (batchExportStatus.saved_conversations.length / batchExportStatus.total_conversations) * 100;
  };

  useEffect(() => {
    startBatchExport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ 
            color: colors.textColor,
            '&:hover': {
              backgroundColor: 'rgba(124, 58, 237, 0.1)',
            }
          }}
        >
          Back to all chats
        </Button>
      </Box>

      <Paper 
        sx={{ 
          p: 4, 
          mb: 3, 
          borderRadius: 4,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        <Typography variant="h4" component="h1" sx={{ color: colors.textColor, mb: 2 }}>
          Batch Export Conversations
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {!batchExportStatus && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress sx={{ color: colors.highlightColor }} />
          </Box>
        )}

        {batchExportStatus && batchExportStatus.status === 'started' && (
          <Box>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }}>
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
                Exporting conversations...
              </Typography>
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={calculateProgress()} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: 'rgba(124, 58, 237, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: colors.highlightColor,
                    }
                  }} 
                />
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Progress: {batchExportStatus.saved_conversations?.length || 0} / {batchExportStatus.total_conversations}
                ({Math.round(calculateProgress())}%)
              </Typography>
              {batchExportStatus.saved_conversations && batchExportStatus.saved_conversations.length > 0 && (
                <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  Latest: {batchExportStatus.saved_conversations[batchExportStatus.saved_conversations.length - 1].path}
                </Typography>
              )}
              {batchExportStatus.errors && batchExportStatus.errors.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 500 }}>
                    Errors encountered: {batchExportStatus.errors.length}
                  </Typography>
                  <Box sx={{ mt: 1, ml: 2 }}>
                    {batchExportStatus.errors.map((error, index) => (
                      <Typography key={index} variant="body2" sx={{ fontSize: '0.8rem', py: 0.5 }}>
                        • {error.session_id}: {error.error}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </Alert>
          </Box>
        )}

        {batchExportStatus && batchExportStatus.status === 'finished' && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleIcon sx={{ mr: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Batch export completed successfully!
              </Typography>
            </Box>
            <Typography variant="body2">
              Exported {batchExportStatus.saved_conversations?.length || 0} conversations to ~/cursor-conversations/
            </Typography>
            {batchExportStatus.errors && batchExportStatus.errors.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 500 }}>
                  Completed with {batchExportStatus.errors.length} error(s)
                </Typography>
                <Box sx={{ mt: 1, ml: 2 }}>
                  {batchExportStatus.errors.map((error, index) => (
                    <Typography key={index} variant="body2" sx={{ fontSize: '0.8rem', py: 0.5 }}>
                      • {error.session_id}: {error.error}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Alert>
        )}

        {batchExportStatus && batchExportStatus.status === 'failed' && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ErrorIcon sx={{ mr: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Batch export failed
              </Typography>
            </Box>
            {batchExportStatus.errors && batchExportStatus.errors.length > 0 && (
              <Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Errors encountered:
                </Typography>
                <Box sx={{ mt: 1, ml: 2 }}>
                  {batchExportStatus.errors.map((error, index) => (
                    <Typography key={index} variant="body2" sx={{ fontSize: '0.8rem', py: 0.5 }}>
                      • {error.session_id}: {error.error}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Alert>
        )}

        {batchExportStatus && batchExportStatus.saved_conversations && batchExportStatus.saved_conversations.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ color: colors.textColor, mb: 2 }}>
              Exported Conversations
            </Typography>
            <Paper 
              sx={{ 
                maxHeight: 400, 
                overflow: 'auto',
                borderRadius: 2,
              }}
            >
              <List dense>
                {batchExportStatus.saved_conversations.map((conv, index) => (
                  <React.Fragment key={conv.session_id}>
                    <ListItem>
                      <ListItemText
                        primary={`Conversation ${index + 1}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                              {conv.path}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              Workspace: {conv.workspace}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < batchExportStatus.saved_conversations.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default BatchExport;