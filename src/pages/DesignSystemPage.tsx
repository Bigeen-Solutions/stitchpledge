import { Box, Typography, Container, Stack, Divider, Paper, Button } from '@mui/material';
import { Timeline } from '@mui/lab';
import { RiskChip } from '../components/RiskChip';
import { DeadlineDisplay } from '../components/DeadlineDisplay';
import { ImmutableTimelineEntry } from '../components/ImmutableTimelineEntry';

export function DesignSystemPage() {
  const mockDeadline = new Date();
  mockDeadline.setDate(mockDeadline.getDate() + 3);

  const overdueDeadline = new Date();
  overdueDeadline.setDate(overdueDeadline.getDate() - 2);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h1" gutterBottom sx={{ color: 'primary.main' }}>
          The Modern Workshop
        </Typography>
        <Typography variant="body1" color="textSecondary">
          StitchFyn Design System & Theme Verification
        </Typography>
      </Box>

      <Stack spacing={6}>
        {/* Palette & Branding */}
        <section>
          <Typography variant="h2" gutterBottom>Palette & Branding</Typography>
          <Paper sx={{ p: 4 }}>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Box sx={{ width: 100, height: 100, bgcolor: 'primary.main', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ color: 'white' }}>Primary</Typography>
              </Box>
              <Box sx={{ width: 100, height: 100, bgcolor: 'secondary.main', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ color: 'white' }}>Secondary</Typography>
              </Box>
              <Box sx={{ width: 100, height: 100, bgcolor: 'success.main', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ color: 'white' }}>Success</Typography>
              </Box>
              <Box sx={{ width: 100, height: 100, bgcolor: 'warning.main', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ color: 'white' }}>Warning</Typography>
              </Box>
              <Box sx={{ width: 100, height: 100, bgcolor: 'error.main', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ color: 'white' }}>Error</Typography>
              </Box>
            </Stack>
          </Paper>
        </section>

        {/* Risk System */}
        <section>
          <Typography variant="h2" gutterBottom>Risk System</Typography>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h3" gutterBottom>RiskChip</Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
              <RiskChip status="ON_TRACK" label="ON_TRACK" />
              <RiskChip status="AT_RISK" label="AT_RISK" />
              <RiskChip status="OVERDUE" label="OVERDUE" />
              <RiskChip status="UNKNOWN" label="UNKNOWN" />
            </Stack>
            
            <Divider sx={{ my: 4 }} />
            
            <Typography variant="h3" gutterBottom>DeadlineDisplay</Typography>
            <Stack spacing={3}>
              <DeadlineDisplay deadline={mockDeadline} riskStatus="ON_TRACK" />
              <DeadlineDisplay deadline={overdueDeadline} riskStatus="OVERDUE" />
            </Stack>
          </Paper>
        </section>

        {/* Interactive Elements */}
        <section>
          <Typography variant="h2" gutterBottom>Interactive Elements</Typography>
          <Paper sx={{ p: 4 }}>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="primary">Contained Primary</Button>
              <Button variant="outlined">Outlined Secondary</Button>
              <Button variant="text">Text Button</Button>
            </Stack>
          </Paper>
        </section>

        {/* Immutable Ledger */}
        <section>
          <Typography variant="h2" gutterBottom>Immutable Ledger</Typography>
          <Paper sx={{ p: 4 }}>
            <Timeline position="right">
              <ImmutableTimelineEntry
                entryType="INTAKE"
                author="John Machine"
                timestamp={new Date()}
                metadata={{ batchId: 'B-992', fiberType: 'Wool' }}
              />
              <ImmutableTimelineEntry
                entryType="ADJUSTMENT"
                author="Sarah Cutter"
                timestamp={new Date()}
                metadata={{ reason: 'Pattern deviation', correction: '2mm inward' }}
              />
              <ImmutableTimelineEntry
                entryType="LOCKED"
                author="System"
                timestamp={new Date()}
                metadata={{ audit: 'PASSED' }}
              />
            </Timeline>
          </Paper>
        </section>
      </Stack>
    </Container>
  );
}
