import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfessionalForm } from '../ProfessionalForm';
import { vi } from 'vitest';

// Mock supabase client
vi.mock('../../../../lib/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => Promise.resolve({ data: [
        { id: 1, nome: 'React', tipo: 'framework' },
        { id: 2, nome: 'JavaScript', tipo: 'linguagem' },
        { id: 3, nome: 'AWS', tipo: 'cloud' }
      ] }),
      insert: () => ({
        select: () => Promise.resolve({ data: [{ id: 4, nome: 'New Skill', tipo: 'framework' }] })
      })
    })
  }
}));

describe('ProfessionalForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnBack = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders the form correctly', async () => {
    render(
      <ProfessionalForm 
        onSubmit={mockOnSubmit} 
        onBack={mockOnBack} 
      />
    );
    
    // Wait for skills to load
    await waitFor(() => {
      expect(screen.getByText('Cadastro Manual')).toBeInTheDocument();
    });
    
    // Check for required fields
    expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gestor da Área/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gestor Direto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Linguagem Principal/i)).toBeInTheDocument();
  });
  
  it('handles form submission correctly', async () => {
    render(
      <ProfessionalForm 
        onSubmit={mockOnSubmit} 
        onBack={mockOnBack} 
      />
    );
    
    // Wait for skills to load
    await waitFor(() => {
      expect(screen.getByText('Cadastro Manual')).toBeInTheDocument();
    });
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/E-mail/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Gestor da Área/i), { target: { value: 'Manager 1' } });
    fireEvent.change(screen.getByLabelText(/Gestor Direto/i), { target: { value: 'Manager 2' } });
    
    // Select a main skill
    const mainSkillSelect = screen.getByLabelText(/Linguagem Principal/i);
    fireEvent.change(mainSkillSelect, { target: { value: 'JavaScript' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Cadastrar Profissional'));
    
    // Check if onSubmit was called with the correct data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        nome_completo: 'John Doe',
        email: 'john@example.com',
        gestor_area: 'Manager 1',
        gestor_direto: 'Manager 2',
        skill_principal: 'JavaScript',
        nivel_experiencia: 'Júnior',
      }));
    });
  });
  
  it('handles back button click', async () => {
    render(
      <ProfessionalForm 
        onSubmit={mockOnSubmit} 
        onBack={mockOnBack} 
      />
    );
    
    // Wait for skills to load
    await waitFor(() => {
      expect(screen.getByText('Cadastro Manual')).toBeInTheDocument();
    });
    
    // Click the back button
    fireEvent.click(screen.getByRole('button', { name: /ArrowLeft/i }));
    
    // Check if onBack was called
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
  
  it('disables form elements when isLoading is true', async () => {
    render(
      <ProfessionalForm 
        onSubmit={mockOnSubmit} 
        onBack={mockOnBack}
        isLoading={true}
      />
    );
    
    // Wait for skills to load
    await waitFor(() => {
      expect(screen.getByText('Cadastro Manual')).toBeInTheDocument();
    });
    
    // Check if form elements are disabled
    expect(screen.getByLabelText(/Nome Completo/i)).toBeDisabled();
    expect(screen.getByLabelText(/E-mail/i)).toBeDisabled();
    expect(screen.getByLabelText(/Gestor da Área/i)).toBeDisabled();
    expect(screen.getByLabelText(/Gestor Direto/i)).toBeDisabled();
    expect(screen.getByLabelText(/Linguagem Principal/i)).toBeDisabled();
    expect(screen.getByText('Processando...')).toBeInTheDocument();
  });
});