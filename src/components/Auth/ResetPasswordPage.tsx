import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextInput,
  Button,
  Title,
  Text,
  Anchor,
  Stack,
  Alert,
  LoadingOverlay
} from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';

export const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your inbox for password reset instructions');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
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
          Reset Password
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="lg">
          Enter your email address and we'll send you a link to reset your password
        </Text>

        {error && (
          <Alert icon={<IconAlertCircle size="1rem" />} color="red" mb="md">
            {error}
          </Alert>
        )}

        {message && (
          <Alert icon={<IconCheck size="1rem" />} color="green" mb="md">
            {message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="your@email.com"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <Button type="submit" fullWidth mt="xl" loading={loading}>
              Send Reset Link
            </Button>
          </Stack>
        </form>

        <Text c="dimmed" size="sm" ta="center" mt="md">
          Remember your password?{' '}
          <Anchor component={Link} to="/login" size="sm">
            Back to Login
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};