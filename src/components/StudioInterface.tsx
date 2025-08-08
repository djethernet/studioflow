import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, Button, Group, Text, LoadingOverlay, Alert, Badge } from '@mantine/core'
import { IconArrowLeft, IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { LibraryPanel } from './LibraryPanel'
import { Canvas } from './Canvas'
import { ConnectionsCanvas } from './ConnectionsCanvas'
import { EquipmentPanel } from './EquipmentPanel'
import { BOMPanel } from './BOMPanel'
import LogPanel from './LogPanel'
import { ProjectService } from '../services/projectService'
import { useAuth } from '../hooks/useAuth'
import { useStudioStore } from '../stores/studioStore'
import type { Project } from '../types/Project'
import classes from '../css/HeaderTabs.module.css';

export const StudioInterface = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { currentUser, isAdmin } = useAuth()
  const { exportStudioData, importStudioData, resetStudioData } = useStudioStore()
  const [activeTab, setActiveTab] = useState<string | null>('layout')
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (projectId && currentUser) {
      loadProject()
    }
  }, [projectId, currentUser])

  const loadProject = async () => {
    try {
      setLoading(true)
      const projectData = await ProjectService.getProject(projectId!)
      
      if (!projectData) {
        setError('Project not found')
        return
      }

      if (projectData.userId !== currentUser!.uid) {
        setError('You do not have access to this project')
        return
      }

      setProject(projectData)
      
      // Load project data into studio store
      if (projectData.studioData) {
        console.log('Loading studio data into store:', projectData.studioData)
        importStudioData(projectData.studioData)
      } else {
        console.log('No studio data found, resetting to empty project')
        resetStudioData()
      }
      
    } catch (error: unknown) {
      console.error('Error loading project:', error)
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToProjects = () => {
    navigate('/projects')
  }

  const handleSaveProject = async () => {
    if (!project) return
    
    try {
      setSaving(true)
      setSaveSuccess(false)
      
      // Get current studio state from zustand store
      const studioData = exportStudioData()
      console.log('Saving studio data:', JSON.stringify(studioData, null, 2))
      
      // Save to Firebase
      await ProjectService.saveProjectData(project.id, studioData)
      
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000) // Hide success message after 3 seconds
      console.log('Project saved successfully')
    } catch (error) {
      console.error('Error saving project:', error)
      setError('Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ height: '100vh', position: 'relative' }}>
        <LoadingOverlay visible />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Alert icon={<IconAlertCircle size="1rem" />} color="red" mb="md">
            {error || 'Project not found'}
          </Alert>
          <Button onClick={handleBackToProjects}>
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Project Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <Group justify="space-between">
          <Group>
            <Button 
              variant="subtle" 
              leftSection={<IconArrowLeft size={16} />}
              onClick={handleBackToProjects}
            >
              Projects
            </Button>
            <Group gap="xs">
              <Text fw={500} size="lg">{project.name}</Text>
              {isAdmin && (
                <Badge size="sm" color="red" variant="filled">
                  ADMIN
                </Badge>
              )}
            </Group>
          </Group>
          <Button 
            onClick={handleSaveProject} 
            variant="light"
            loading={saving}
            leftSection={saveSuccess ? <IconCheck size={16} /> : undefined}
            color={saveSuccess ? "green" : undefined}
          >
            {saveSuccess ? 'Saved!' : 'Save Project'}
          </Button>
        </Group>
      </div>

      {/* Studio Interface */}
      <Tabs 
        value={activeTab} 
        onChange={setActiveTab} 
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
        variant="outline"
        radius="md"

           classNames={{
            root: classes.tabs,
            list: classes.tabsList,
            tab: classes.tab,
          }}
      >
        <Tabs.List 
          style={{ 
            backgroundColor: 'var(--mantine-color-gray-0)',
            borderBottom: '1px solid var(--mantine-color-gray-3)',
            padding: '0 16px'
          }}
        >
          <Tabs.Tab value="layout" fw={500} size="md">Layout</Tabs.Tab>
          <Tabs.Tab value="connections" fw={500} size="md">Connections</Tabs.Tab>
          <Tabs.Tab value="bom" fw={500} size="md">Project Summary</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="layout" style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <LibraryPanel />
          <Canvas />
          <EquipmentPanel />
        </Tabs.Panel>

        <Tabs.Panel value="connections" style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <ConnectionsCanvas />
          <EquipmentPanel showConnections={true} />
        </Tabs.Panel>

        <Tabs.Panel value="bom" style={{ flex: 1, display: 'flex' }}>
          <BOMPanel />
        </Tabs.Panel>
      </Tabs>
      
      <LogPanel />
    </div>
  )
}