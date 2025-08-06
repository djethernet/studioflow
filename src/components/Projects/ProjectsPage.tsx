import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Button,
  Card,
  Group,
  Stack,
  SimpleGrid,
  Modal,
  TextInput,
  Textarea,
  Alert,
  LoadingOverlay,
  Menu,
  ActionIcon,
  Badge,
  Avatar
} from '@mantine/core';
import { 
  IconPlus, 
  IconSettings, 
  IconTrash, 
  IconEdit, 
  IconDots, 
  IconLogout,
  IconAlertCircle,
  IconBuilding
} from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth';
import { ProjectService } from '../../services/projectService';
import type { Project, CreateProjectData } from '../../types/Project';

export const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<CreateProjectData>({ name: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadProjects();
    }
  }, [currentUser]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const userProjects = await ProjectService.getUserProjects(currentUser!.uid);
      setProjects(userProjects);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load projects';
      setError(errorMessage);
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setFormLoading(true);
      setError('');
      const projectId = await ProjectService.createProject(currentUser!.uid, formData);
      setCreateModalOpen(false);
      setFormData({ name: '', description: '' });
      await loadProjects();
      // Navigate to the new project
      navigate(`/studio/${projectId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
      setError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      setFormLoading(true);
      await ProjectService.deleteProject(selectedProject.id);
      setDeleteModalOpen(false);
      setSelectedProject(null);
      await loadProjects();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project';
      setError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error: unknown) {
      console.error('Logout error:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <LoadingOverlay visible />
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1} c="blue" mb="xs">StudioFlow</Title>
          <Text c="dimmed">Your studio design projects</Text>
        </div>
        
        <Group>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="subtle" size="lg">
                <Avatar size="sm" color="blue">
                  {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0)}
                </Avatar>
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconSettings size={14} />}>
                Settings
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                leftSection={<IconLogout size={14} />} 
                color="red"
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      {/* Welcome message for new users */}
      {projects.length === 0 && (
        <Card withBorder p="xl" radius="md" mb="xl" ta="center">
          <IconBuilding size={48} color="var(--mantine-color-blue-5)" />
          <Title order={2} mt="md" mb="xs">Welcome to StudioFlow!</Title>
          <Text c="dimmed" mb="lg">
            Create your first studio design project to get started with visual studio planning
          </Text>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateModalOpen(true)}
            size="md"
          >
            Create Your First Project
          </Button>
        </Card>
      )}

      {/* Projects Grid */}
      {projects.length > 0 && (
        <>
          <Group justify="space-between" mb="md">
            <Title order={2}>Your Projects</Title>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCreateModalOpen(true)}
            >
              New Project
            </Button>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {projects.map((project) => (
              <Card key={project.id} withBorder shadow="sm" radius="md" padding="lg">
                <Card.Section withBorder inheritPadding py="xs">
                  <Group justify="space-between">
                    <Text fw={500}>{project.name}</Text>
                    <Menu shadow="md" width={150}>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconEdit size={14} />}>
                          Rename
                        </Menu.Item>
                        <Menu.Item 
                          leftSection={<IconTrash size={14} />} 
                          color="red"
                          onClick={() => {
                            setSelectedProject(project);
                            setDeleteModalOpen(true);
                          }}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Card.Section>

                <Stack gap="xs" mt="md" mb="xs">
                  {project.description && (
                    <Text size="sm" c="dimmed">
                      {project.description}
                    </Text>
                  )}
                  
                  <Group gap="xs">
                    <Badge variant="light" size="xs">
                      Created {formatDate(project.createdAt)}
                    </Badge>
                    {project.updatedAt > project.createdAt && (
                      <Badge variant="light" size="xs" color="green">
                        Updated {formatDate(project.updatedAt)}
                      </Badge>
                    )}
                  </Group>
                </Stack>

                <Button
                  component={Link}
                  to={`/studio/${project.id}`}
                  variant="light"
                  fullWidth
                  mt="md"
                >
                  Open Project
                </Button>
              </Card>
            ))}
          </SimpleGrid>
        </>
      )}

      {/* Error Alert */}
      {error && (
        <Alert icon={<IconAlertCircle size="1rem" />} color="red" mt="md">
          {error}
        </Alert>
      )}

      {/* Create Project Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setFormData({ name: '', description: '' });
          setError('');
        }}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject}>
          <Stack>
            {error && (
              <Alert icon={<IconAlertCircle size="1rem" />} color="red">
                {error}
              </Alert>
            )}
            
            <TextInput
              label="Project Name"
              placeholder="My Studio Design"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={formLoading}
            />

            <Textarea
              label="Description (optional)"
              placeholder="Brief description of your studio project..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={formLoading}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={() => {
                  setCreateModalOpen(false);
                  setFormData({ name: '', description: '' });
                  setError('');
                }}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button type="submit" loading={formLoading}>
                Create Project
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Project Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedProject(null);
        }}
        title="Delete Project"
      >
        <Stack>
          <Text>
            Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.
          </Text>
          
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedProject(null);
              }}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button 
              color="red" 
              onClick={handleDeleteProject}
              loading={formLoading}
            >
              Delete Project
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};