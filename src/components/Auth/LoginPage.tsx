import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Anchor,
  Stack,
  Alert,
  LoadingOverlay,
  Group
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, currentUser } = useAuth();

  // Redirect if already authenticated
  if (currentUser) {
    return <Navigate to="/projects" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900} c="blue" mb="xl">
        StudioFlow
      </Title>
      
      <Paper withBorder shadow="md" p={30} radius="md" pos="relative">
        <LoadingOverlay visible={loading} />
        
        <Title order={2} ta="center" mb="md">
          Welcome back!
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="lg">
          Sign in to access your studio projects
        </Text>

        {error && (
          <Alert icon={<IconAlertCircle size="1rem" />} color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <Group justify="space-between" mt="sm">
              <Anchor component={Link} to="/reset-password" size="sm">
                Forgot password?
              </Anchor>
            </Group>

            <Button type="submit" fullWidth mt="xl" loading={loading}>
              Sign in
            </Button>
          </Stack>
        </form>

        <Text c="dimmed" size="sm" ta="center" mt="md">
          Don't have an account yet?{' '}
          <Anchor component={Link} to="/signup" size="sm">
            Create account
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};