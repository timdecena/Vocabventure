// File: src/pages/Support.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';

const PlanCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
}));

export default function Support() {
  const theme = useTheme();
  const [planType, setPlanType] = useState('personal');
  const handlePlanType = (_e, newType) => newType && setPlanType(newType);

  const personalPlans = [
    {
      badge: 'Bronze',
      price: '₱499',
      features: [
        'Access to all new story releases',
        'Monthly basic in-game items pack',
        'Bronze supporter badge on your profile',
      ],
    },
    {
      badge: 'Silver',
      price: '₱999',
      features: [
        'Everything in Bronze',
        'Advance access to upcoming game modes',
        'Monthly bonus in-game gold for skins',
        'Silver supporter badge on your profile',
      ],
    },
    {
      badge: 'Diamond',
      price: '₱1,999',
      features: [
        'Everything in Silver',
        'Exclusive skins & avatars',
        'Behind-the-scenes dev diaries',
        'Monthly live Q&A with the dev team',
        'Priority support & invite-only events',
        'Diamond supporter badge on your profile',
      ],
    },
  ];

  const institutionalPlans = [
    {
      badge: 'Enterprise Bronze',
      price: '₱4,999',
      features: [
        'All Diamond personal perks',
        'Up to 10 user licenses',
        'Dedicated chat support channel',
        'Basic usage analytics dashboard',
        'Enterprise Bronze badge on company profile',
      ],
    },
    {
      badge: 'Enterprise Silver',
      price: '₱9,999',
      features: [
        'Everything in Enterprise Bronze',
        'Onboarding & live training session',
        'Detailed monthly usage & progress reports',
        'Custom word-list creation tools',
        'Priority feature requests',
        'Email notifications for major updates',
        'Enterprise Silver badge on company profile',
      ],
    },
    {
      badge: 'Enterprise Gold',
      price: '₱19,999',
      features: [
        'Everything in Enterprise Silver',
        'Full API access for integration',
        'Quarterly strategy & curriculum review',
        'Dedicated account manager',
        'Co-branding and marketing support',
        'On-site workshop & teacher certification',
        'Early access to all beta features',
        'Enterprise Gold badge on company profile',
      ],
    },
  ];

  const plans = planType === 'personal' ? personalPlans : institutionalPlans;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        py: 6,
        px: 2,
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}
      >
        Choose Your Support Tier
      </Typography>

      <Box textAlign="center" mb={4}>
        <ToggleButtonGroup
          value={planType}
          exclusive
          onChange={handlePlanType}
          sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}
        >
          <ToggleButton value="personal">Personal</ToggleButton>
          <ToggleButton value="institutional">Institutional</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan) => (
          <Grid key={plan.badge} item xs={12} sm={6} md={4}>
            <PlanCard>
              <CardContent>
                <Typography
                  variant="subtitle1"
                  sx={{ color: theme.palette.secondary.main, fontWeight: 700 }}
                >
                  {plan.badge}
                </Typography>

                <Typography variant="h3" sx={{ my: 2, fontWeight: 600 }}>
                  {plan.price}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {plan.features.map((feat, idx) => (
                  <Typography key={idx} variant="body2" sx={{ textAlign: 'left', mb: 1 }}>
                    • {feat}
                  </Typography>
                ))}
              </CardContent>

              <Box sx={{ p: 2 }}>
                <Button variant="contained" fullWidth size="large">
                  Choose {plan.badge}
                </Button>
              </Box>
            </PlanCard>
          </Grid>
        ))}
      </Grid>

      {/* Back to Home button */}
      <Box textAlign="center" mt={6}>
        <Button
          component={Link}
          to="/"
          variant="outlined"
          size="large"
          sx={{ color: theme.palette.secondary.main, borderColor: theme.palette.secondary.main }}
        >
          ← Back to Home
        </Button>
      </Box>
    </Box>
  );
}
