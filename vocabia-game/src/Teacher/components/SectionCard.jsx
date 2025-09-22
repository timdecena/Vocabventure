import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, Box } from '@mui/material';
import { t } from '../utils/i18n';

export default function SectionCard({ title, subtitle, action, children, sx }) {
  return (
    <Card role="region" aria-label={typeof title === 'string' ? title : t('Section')} sx={sx}>
      {(title || subtitle || action) && (
        <CardHeader
          titleTypographyProps={{ variant: 'h6', component: 'h2' }}
          title={title}
          subheader={subtitle}
          action={action}
          sx={{ pb: 0.5 }}
        />
      )}
      <CardContent>
        <Box>{children}</Box>
      </CardContent>
    </Card>
  );
}

SectionCard.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  action: PropTypes.node,
  children: PropTypes.node,
  sx: PropTypes.object,
};
