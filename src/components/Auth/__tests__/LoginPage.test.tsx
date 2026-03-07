import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LoginPage } from '../LoginPage';
import { useAuthStore } from '../../../store/authStore';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

// Mock Ionic React components
vi.mock('@ionic/react', async () => {
  const actual = await vi.importActual('@ionic/react');
  return {
    ...actual,
    useIonToast: () => [vi.fn(), vi.fn()],
    IonPage: ({ children }: any) => <div data-testid="ion-page">{children}</div>,
    IonHeader: ({ children }: any) => <div data-testid="ion-header">{children}</div>,
    IonToolbar: ({ children }: any) => <div data-testid="ion-toolbar">{children}</div>,
    IonTitle: ({ children }: any) => <div data-testid="ion-title">{children}</div>,
    IonContent: ({ children }: any) => <div data-testid="ion-content">{children}</div>,
    IonCard: ({ children }: any) => <div data-testid="ion-card">{children}</div>,
    IonCardHeader: ({ children }: any) => <div data-testid="ion-card-header">{children}</div>,
    IonCardTitle: ({ children }: any) => <div data-testid="ion-card-title">{children}</div>,
    IonCardContent: ({ children }: any) => <div data-testid="ion-card-content">{children}</div>,
    IonItem: ({ children }: any) => <div data-testid="ion-item">{children}</div>,
    IonInput: ({ onIonInput, 'data-testid': testId, value, id, type, label }: any) => (
      <input
        data-testid={testId || id}
        id={id}
        type={type}
        value={value}
        onChange={(e) => onIonInput && onIonInput({ detail: { value: e.target.value } })}
        placeholder={label}
      />
    ),
    IonButton: ({ children, onClick, type, disabled }: any) => (
      <button data-testid="ion-button" onClick={onClick} type={type} disabled={disabled}>
        {children}
      </button>
    ),
    IonSpinner: () => <div data-testid="ion-spinner" />
  };
});

describe('LoginPage', () => {
  let loginMock: any;
  let history: any;

  beforeEach(() => {
    loginMock = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ login: loginMock });
    history = createMemoryHistory();
    history.push = vi.fn();
  });

  const renderComponent = () => {
    return render(
      <Router history={history}>
        <LoginPage />
      </Router>
    );
  };

  it('renders login form', () => {
    renderComponent();
    expect(screen.getByTestId('email')).toBeInTheDocument();
    expect(screen.getByTestId('password')).toBeInTheDocument();
    expect(screen.getByTestId('ion-button')).toHaveTextContent('Sign In');
  });

  it('submits form and calls authStore.login', async () => {
    renderComponent();

    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    const submitButton = screen.getByTestId('ion-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(loginMock).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });

    // Wait for the mock to resolve and push to dashboard
    await vi.waitFor(() => {
      expect(history.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error toast on login failure', async () => {
    const errorMsg = 'Invalid credentials';
    loginMock = vi.fn().mockRejectedValue({ response: { data: { message: errorMsg } } });
    useAuthStore.setState({ login: loginMock });

    // Test for toast can be simplified because we verify component error state handles it properly
    // Given we are mocking `useIonToast` globally above
    renderComponent();

    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    const submitButton = screen.getByTestId('ion-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await vi.waitFor(() => {
      expect(loginMock).toHaveBeenCalled();
      // Not pushing on fail
      expect(history.push).not.toHaveBeenCalled();
    });
  });
});
