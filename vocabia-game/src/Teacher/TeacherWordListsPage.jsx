import React from 'react';
import { Container, Box, Button } from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PageHeader from './components/PageHeader';
import EmptyState from './components/EmptyState';
import { t } from './utils/i18n';

export default function TeacherWordListsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <PageHeader
        backTo="/teacher-home"
        backLabel={t('Back to Dashboard')}
        title={<Box sx={{ display: 'flex', alignItems: 'center' }}><LibraryBooksIcon sx={{ mr: 1.5, color: 'primary.main' }} />{t('Custom Word Lists')}</Box>}
        subtitle={t('Create and manage your custom vocabulary lists for assignments and practice')}
      />

      <EmptyState
        icon={<LibraryBooksIcon sx={{ fontSize: 56 }} />}
        title={t('No word lists yet')}
        description={t('Get started by creating your first custom word list tailored to your class objectives.')}
        action={<Button variant="contained" disabled>{t('Create List (coming soon)')}</Button>}
      />
    </Container>
  );
}
