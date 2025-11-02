import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  Paper,
  Container,
  Snackbar,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

const StudentFeedback = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    grade: '',
    rating: 0,
    comments: ''
  });
  const [showThankYou, setShowThankYou] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRatingChange = (event, newValue) => {
    setFormData({
      ...formData,
      rating: newValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.grade || formData.rating === 0) {
      setError('Please fill in all required fields and provide a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/feedback/submit', formData);
      
      if (response.data.success) {
        setShowThankYou(true);
        // Reset form
        setFormData({
          name: '',
          email: '',
          grade: '',
          rating: 0,
          comments: ''
        });
        
        // Hide thank you message after 3 seconds
        setTimeout(() => {
          setShowThankYou(false);
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            padding: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#667eea',
                marginBottom: 1
              }}
            >
              Comments & Suggestions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We'd love to hear your feedback!
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Name */}
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />

              {/* Email */}
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />

              {/* Grade */}
              <TextField
                label="Grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                placeholder="e.g., Grade 7, Grade 10, College"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />

              {/* Rating */}
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    marginBottom: 1,
                    fontWeight: 500,
                    color: '#333'
                  }}
                >
                  Rate Your Experience *
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Rating
                    name="rating"
                    value={formData.rating}
                    onChange={handleRatingChange}
                    size="large"
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: '#ffd700',
                      },
                      '& .MuiRating-iconHover': {
                        color: '#ffc107',
                      },
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {formData.rating > 0 ? `${formData.rating} star${formData.rating > 1 ? 's' : ''}` : 'No rating'}
                  </Typography>
                </Box>
              </Box>

              {/* Comments */}
              <TextField
                label="Comments and Suggestions"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                multiline
                rows={5}
                fullWidth
                variant="outlined"
                placeholder="Share your thoughts, suggestions, or any feedback you have..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />

              {/* Error Message */}
              {error && (
                <Alert severity="error" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {/* Buttons */}
              <Box sx={{ display: 'flex', gap: 2, marginTop: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/home')}
                  fullWidth
                  sx={{
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#5568d3',
                      backgroundColor: 'rgba(102, 126, 234, 0.04)',
                    },
                  }}
                >
                  Back to Home
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<SendIcon />}
                  disabled={loading}
                  fullWidth
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #653a8e 100%)',
                    },
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>

      {/* Thank You Snackbar */}
      <Snackbar
        open={showThankYou}
        autoHideDuration={3000}
        onClose={() => setShowThankYou(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowThankYou(false)}
          severity="success"
          sx={{
            width: '100%',
            fontSize: '1.1rem',
            '& .MuiAlert-icon': {
              fontSize: '2rem'
            }
          }}
        >
          🎉 Thank you for your feedback! We appreciate your input!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentFeedback;

