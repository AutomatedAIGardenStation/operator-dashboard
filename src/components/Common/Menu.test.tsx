import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Menu } from './Menu';

describe('Menu', () => {
  it('renders standard app pages', () => {
    // Note: Due to Ionic web component shadow DOM mounting with JSDOM,
    // we use getByText but in test environment some inner text of IonLabel might not be found standardly.
    // We can just verify the IonItem tags hrefs.

    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Menu />
        <div id="main">Main content mock</div>
      </MemoryRouter>
    );

    expect(screen.getByText('GardenStation')).toBeInTheDocument();
    expect(screen.getByText('Operator Dashboard')).toBeInTheDocument();

    // Verify standard links are present by querying IonItem elements and their routerLink attribute
    const links = Array.from(container.querySelectorAll('ion-item'));
    const hrefs = links.map(link => link.getAttribute('router-link'));

    expect(hrefs).toContain('/dashboard');
    expect(hrefs).toContain('/monitoring');
    expect(hrefs).toContain('/controls');
    expect(hrefs).toContain('/plants');
    expect(hrefs).toContain('/harvest');
    expect(hrefs).toContain('/settings');
  });
});
