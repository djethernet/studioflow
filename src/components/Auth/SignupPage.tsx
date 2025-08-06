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
  LoadingOverlay
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';

export const SignupPage = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup, currentUser } = useAuth();

  // Redirect if already authenticated
  if (currentUser) {
    return <Navigate to="/projects" replace />;
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.displayName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signup(formData.email, formData.password, formData.displayName);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
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
          Create Account
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="lg">
          Join StudioFlow to start designing your studio
        </Text>

        {error && (
          <Alert icon={<IconAlertCircle size="1rem" />} color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Full Name"
              placeholder="John Doe"
              required
              value={formData.displayName}
              onChange={handleChange('displayName')}
              disabled={loading}
            />

            <TextInput
              label="Email"
              placeholder="your@email.com"
              type="email"
              required
              value={formData.email}
              onChange={handleChange('email')}
              disabled={loading}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              value={formData.password}
              onChange={handleChange('password')}
              disabled={loading}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              required
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              disabled={loading}
            />

            <Button type="submit" fullWidth mt="xl" loading={loading}>
              Create Account
            </Button>
          </Stack>
        </form>

        <Text c="dimmed" size="sm" ta="center" mt="md">
          Already have an account?{' '}
          <Anchor component={Link} to="/login" size="sm">
            Sign in
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};