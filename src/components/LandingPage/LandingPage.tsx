import { Button, Container, Text, Title, Group, Box, Paper, Grid, Stack, Badge, Card, rem } from '@mantine/core'
import { IconTool, IconPlug, IconAlertTriangle, IconCheck } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './LandingPage.css'

export function LandingPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const handleStartFree = () => {
    if (currentUser) {
      navigate('/projects')
    } else {
      navigate('/signup')
    }
  }

  const handleUnlockPro = () => {
    // TODO: Implement Stripe payment integration
    alert('Pro version coming soon!')
  }

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <Box className="navbar" py="md">
        <Container size="xl">
          <Group justify="space-between">
            <Title order={3} className="logo">StudioFlow</Title>
            <Button variant="outline" onClick={() => navigate('/login')}>
              Login
            </Button>
          </Group>
        </Container>
      </Box>

      {/* Hero Section */}
      <section className="hero-section">
        <Container size="xl">
          <Grid gutter="xl" align="center">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="lg">
                <Title className="hero-title">
                  Get Your Studio Right the First Time.
                </Title>
                <Text size="xl" className="hero-subtitle">
                  Plan, connect, and verify your setup before you buy or install — avoid costly mistakes.
                </Text>
                <Group>
                  <Button size="lg" className="cta-primary" onClick={handleStartFree}>
                    Start Free
                  </Button>
                  <Button size="lg" variant="outline" className="cta-secondary" onClick={handleUnlockPro}>
                    Unlock Pro — $49 or $8/mo
                  </Button>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper shadow="xl" radius="md" className="hero-visual">
                <Box className="hero-image-placeholder">
                  <Text align="center" c="dimmed">Studio Layout Preview</Text>
                </Box>
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* Pain Point Section */}
      <section className="pain-point-section">
        <Container size="xl">
          <Title order={2} ta="center" mb="xl">
            Mistakes Here Cost Time and Money.
          </Title>
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" className="pain-point-card">
                <Stack align="center" gap="md">
                  <IconPlug size={48} className="pain-icon" />
                  <Title order={4}>Wrong cable lengths waste budget.</Title>
                  <Text ta="center" size="sm" c="dimmed">
                    Ordering incorrect cables means returns, delays, and wasted money.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" className="pain-point-card">
                <Stack align="center" gap="md">
                  <IconTool size={48} className="pain-icon" />
                  <Title order={4}>Bad ergonomics hurt productivity.</Title>
                  <Text ta="center" size="sm" c="dimmed">
                    Poor desk and speaker placement leads to fatigue and mixing errors.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" className="pain-point-card">
                <Stack align="center" gap="md">
                  <IconAlertTriangle size={48} className="pain-icon" />
                  <Title order={4}>Install delays from missing equipment.</Title>
                  <Text ta="center" size="sm" c="dimmed">
                    Forgotten adapters and connectors stop your project cold.
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <Container size="xl">
          <Title order={2} ta="center" mb="xl">
            How It Works
          </Title>
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card shadow="md" padding="lg" radius="md" className="step-card">
                <Stack align="center" gap="md">
                  <Text size="3rem" fw={700} c="#ff6b35" lh={1}>
                    1
                  </Text>
                  <Title order={4}>Draw Your Room</Title>
                  <Text ta="center" size="sm" c="dimmed">
                    Set your dimensions & layout zones.
                  </Text>
                  <Box className="step-image-placeholder">
                    <Text align="center" c="dimmed" size="xs">Room Layout</Text>
                  </Box>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card shadow="md" padding="lg" radius="md" className="step-card">
                <Stack align="center" gap="md">
                  <Text size="3rem" fw={700} c="#ff6b35" lh={1}>
                    2
                  </Text>
                  <Title order={4}>Add Your Gear</Title>
                  <Text ta="center" size="sm" c="dimmed">
                    Choose from our pro gear library.
                  </Text>
                  <Box className="step-image-placeholder">
                    <Text align="center" c="dimmed" size="xs">Gear Library</Text>
                  </Box>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card shadow="md" padding="lg" radius="md" className="step-card">
                <Stack align="center" gap="md">
                  <Text size="3rem" fw={700} c="#ff6b35" lh={1}>
                    3
                  </Text>
                  <Title order={4}>Connect It Right</Title>
                  <Text ta="center" size="sm" c="dimmed">
                    Snap-to-connect cables, auto BOM & error check.
                  </Text>
                  <Box className="step-image-placeholder">
                    <Text align="center" c="dimmed" size="xs">Cable Connections</Text>
                  </Box>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* Feature Highlights Section */}
      <section className="features-section">
        <Container size="xl">
          <Stack gap="xl">
            <Grid gutter="xl" align="center">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                  <Title order={3}>Full Gear Library</Title>
                  <Text size="lg" c="dimmed">
                    Stop guessing rack fit. Our comprehensive library includes real gear with accurate dimensions,
                    rack units, and connection specs from top manufacturers.
                  </Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper shadow="md" radius="md" className="feature-image-placeholder">
                  <Text align="center" c="dimmed">Gear Library Screenshot</Text>
                </Paper>
              </Grid.Col>
            </Grid>

            <Grid gutter="xl" align="center">
              <Grid.Col span={{ base: 12, md: 6 }} orderProp={{ base: 2, md: 1 }}>
                <Paper shadow="md" radius="md" className="feature-image-placeholder">
                  <Text align="center" c="dimmed">Cable Validation Screenshot</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }} orderProp={{ base: 1, md: 2 }}>
                <Stack gap="md">
                  <Title order={3}>Cable Error Checking</Title>
                  <Text size="lg" c="dimmed">
                    Catch problems before install. Our smart validation system checks cable compatibility,
                    connector types, and warns about potential issues.
                  </Text>
                </Stack>
              </Grid.Col>
            </Grid>

            <Grid gutter="xl" align="center">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                  <Title order={3}>Instant BOM Export</Title>
                  <Text size="lg" c="dimmed">
                    Send lists straight to vendors. Export complete equipment and cable lists as CSV or PDF
                    with accurate quantities and specifications.
                  </Text>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper shadow="md" radius="md" className="feature-image-placeholder">
                  <Text align="center" c="dimmed">BOM Export Screenshot</Text>
                </Paper>
              </Grid.Col>
            </Grid>
          </Stack>
        </Container>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <Container size="lg">
          <Title order={2} ta="center" mb="xl">
            Simple, Transparent Pricing
          </Title>
          <Grid gutter="xl" justify="center" style={{ paddingTop: '20px', overflow: 'visible' }}>
            <Grid.Col span={{ base: 12, sm: 5 }}>
              <Card shadow="md" padding="xl" radius="md" className="pricing-card">
                <Stack gap="lg">
                  <Title order={3} ta="center">Free</Title>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconCheck size={20} className="check-icon" />
                      <Text>Basic room layout</Text>
                    </Group>
                    <Group gap="xs">
                      <IconCheck size={20} className="check-icon" />
                      <Text>Limited gear library</Text>
                    </Group>
                    <Group gap="xs">
                      <Text c="dimmed" td="line-through" ml={rem(24)}>Full gear library</Text>
                    </Group>
                    <Group gap="xs">
                      <Text c="dimmed" td="line-through" ml={rem(24)}>Cable error checking</Text>
                    </Group>
                    <Group gap="xs">
                      <Text c="dimmed" td="line-through" ml={rem(24)}>BOM/PDF export</Text>
                    </Group>
                  </Stack>
                  <Button size="lg" variant="outline" fullWidth onClick={handleStartFree}>
                    Start Free
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 5 }} style={{ overflow: 'visible' }}>
              <Card shadow="xl" padding="xl" radius="md" className="pricing-card pricing-card-pro" style={{ overflow: 'visible' }}>
                <Badge className="best-value-badge" size="lg" radius="sm">
                  Best Value
                </Badge>
                <Stack gap="lg">
                  <Title order={3} ta="center">Pro</Title>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconCheck size={20} className="check-icon-pro" />
                      <Text>Everything in Free</Text>
                    </Group>
                    <Group gap="xs">
                      <IconCheck size={20} className="check-icon-pro" />
                      <Text>Full gear library</Text>
                    </Group>
                    <Group gap="xs">
                      <IconCheck size={20} className="check-icon-pro" />
                      <Text>Cable error checking</Text>
                    </Group>
                    <Group gap="xs">
                      <IconCheck size={20} className="check-icon-pro" />
                      <Text>BOM/PDF export</Text>
                    </Group>
                    <Group gap="xs">
                      <IconCheck size={20} className="check-icon-pro" />
                      <Text>Priority support</Text>
                    </Group>
                  </Stack>
                  <Stack gap="xs" align="center">
                    <Text size="xl" fw={700}>$8/month or $49 lifetime</Text>
                  </Stack>
                  <Button size="lg" className="unlock-pro-button" fullWidth onClick={handleUnlockPro}>
                    Unlock Pro
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      </section>

      {/* Social Proof Section */}
      <section className="social-proof-section">
        <Container size="xl">
          <Stack gap="xl">
            <Group justify="center" gap="xl" wrap="wrap">
              <Box className="brand-logo-placeholder">
                <Text c="dimmed" size="sm">Brand Logo</Text>
              </Box>
              <Box className="brand-logo-placeholder">
                <Text c="dimmed" size="sm">Brand Logo</Text>
              </Box>
              <Box className="brand-logo-placeholder">
                <Text c="dimmed" size="sm">Brand Logo</Text>
              </Box>
              <Box className="brand-logo-placeholder">
                <Text c="dimmed" size="sm">Brand Logo</Text>
              </Box>
            </Group>
            <Grid gutter="xl">
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" className="testimonial-card">
                  <Stack gap="md">
                    <Text size="lg" fs="italic">
                      "StudioFlow saved us from ordering $500 in wrong cables."
                    </Text>
                    <Text size="sm" c="dimmed">
                      — Beta User, AV Integrator
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" className="testimonial-card">
                  <Stack gap="md">
                    <Text size="lg" fs="italic">
                      "Finally, a tool that understands pro audio workflows."
                    </Text>
                    <Text size="sm" c="dimmed">
                      — Studio Designer
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" className="testimonial-card">
                  <Stack gap="md">
                    <Text size="lg" fs="italic">
                      "The rack mounting system alone is worth the price."
                    </Text>
                    <Text size="sm" c="dimmed">
                      — Recording Engineer
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
          </Stack>
        </Container>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <Container size="md">
          <Stack align="center" gap="xl">
            <Title order={2} ta="center">
              Plan with Confidence. Install Without Surprises.
            </Title>
            <Button size="xl" className="cta-primary" onClick={handleStartFree}>
              Start Free
            </Button>
          </Stack>
        </Container>
      </section>

      {/* Footer */}
      <Box className="footer" py="xl">
        <Container size="xl">
          <Group justify="center" gap="md">
            <Text size="sm" c="dimmed">© 2025 StudioFlow</Text>
            <Text size="sm" c="dimmed">•</Text>
            <Text size="sm" c="dimmed">Made for audio professionals</Text>
          </Group>
        </Container>
      </Box>
    </div>
  )
}