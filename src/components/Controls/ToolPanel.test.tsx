import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ToolPanel } from './ToolPanel';
import * as tools from '../../api/tools';
import { getSocket } from '../../hooks/useWebSocket';

vi.mock('../../api/tools', () => ({
  dockTool: vi.fn(),
  releaseTool: vi.fn(),
  getCurrentTool: vi.fn(),
}));

vi.mock('../../hooks/useWebSocket', () => ({
  getSocket: vi.fn(),
}));

describe('ToolPanel', () => {
  const onSuccess = vi.fn();
  const onError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (tools.getCurrentTool as any).mockResolvedValue({ tool_type: 'CAMERA' });
    (getSocket as any).mockReturnValue({
      on: vi.fn(),
      off: vi.fn(),
    });
  });

  it('renders correctly and fetches current tool', async () => {
    render(<ToolPanel disabled={false} onSuccess={onSuccess} onError={onError} />);
    await waitFor(() => {
      expect(tools.getCurrentTool).toHaveBeenCalled();
      expect(screen.getByText('CAMERA')).toBeInTheDocument();
    });
  });

  it('calls dockTool on Dock click', async () => {
    (tools.dockTool as any).mockResolvedValueOnce(undefined);
    render(<ToolPanel disabled={false} onSuccess={onSuccess} onError={onError} />);

    await waitFor(() => {
      expect(tools.getCurrentTool).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('Dock'));

    expect(tools.dockTool).toHaveBeenCalled();

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('Docking current tool');
    });
  });

  it('calls releaseTool on Release click', async () => {
    (tools.releaseTool as any).mockResolvedValueOnce(undefined);
    render(<ToolPanel disabled={false} onSuccess={onSuccess} onError={onError} />);

    await waitFor(() => {
      expect(tools.getCurrentTool).toHaveBeenCalled();
    });

    const selector = document.querySelector('ion-select') as any;
    fireEvent(selector, new CustomEvent('ionChange', { detail: { value: 'POLLINATOR' } }));

    fireEvent.click(screen.getByText('Release'));

    expect(tools.releaseTool).toHaveBeenCalledWith('POLLINATOR');

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('Releasing tool: POLLINATOR');
    });
  });
});
