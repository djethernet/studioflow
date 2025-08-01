import { Box, Paper, Text, ActionIcon, Group, ScrollArea } from '@mantine/core';
import { IconX, IconAlertTriangle, IconInfoCircle, IconCircleCheck } from '@tabler/icons-react';
import { useStudioStore } from '../stores/studioStore';

export type LogLevel = 'info' | 'warning' | 'success';

export interface LogMessage {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: Date;
}

const LogPanel = () => {
  const { logMessages, clearLogMessage, clearAllLogs } = useStudioStore();

  const getIcon = (level: LogLevel) => {
    switch (level) {
      case 'warning':
        return <IconAlertTriangle size={16} color="orange" />;
      case 'success':
        return <IconCircleCheck size={16} color="green" />;
      case 'info':
      default:
        return <IconInfoCircle size={16} color="blue" />;
    }
  };

  const getColor = (level: LogLevel) => {
    switch (level) {
      case 'warning':
        return 'orange';
      case 'success':
        return 'green';
      case 'info':
      default:
        return 'blue';
    }
  };

  if (logMessages.length === 0) {
    return null;
  }

  return (
    <Paper withBorder p="xs" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}>
      <Group justify="space-between" mb="xs">
        <Text size="sm" fw={500}>Messages</Text>
        {logMessages.length > 1 && (
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={clearAllLogs}
            aria-label="Clear all messages"
          >
            <IconX size={14} />
          </ActionIcon>
        )}
      </Group>
      
      <ScrollArea.Autosize mah={120}>
        <Box>
          {logMessages.map((log) => (
            <Group key={log.id} justify="space-between" py="xs" px="sm">
              <Group gap="xs">
                {getIcon(log.level)}
                <Text size="sm" c={getColor(log.level)}>
                  {log.message}
                </Text>
                <Text size="xs" c="dimmed">
                  {log.timestamp.toLocaleTimeString()}
                </Text>
              </Group>
              <ActionIcon
                variant="subtle"
                size="xs"
                onClick={() => clearLogMessage(log.id)}
                aria-label="Clear message"
              >
                <IconX size={12} />
              </ActionIcon>
            </Group>
          ))}
        </Box>
      </ScrollArea.Autosize>
    </Paper>
  );
};

export default LogPanel;