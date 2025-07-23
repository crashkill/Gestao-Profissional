import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, Check } from 'lucide-react';
import { Professional, AREAS, MAIN_SKILLS, SKILL_COLUMN_MAP } from '../../../types/Professional';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '../../ui/command';
import { Button } from '../../ui/button';
import { supabase } from '../../../lib/supabaseClient';
import { BaseComponentProps, LoadableProps } from '../../core/types';
import { cn } from '../../core/utils/cn';
import { Form } from '../../forms/form';

/**
 * Interface for ProfessionalForm props
 */
export interface ProfessionalFormProps extends BaseComponentProps, LoadableProps {
  /** Callback when form is submitted */
  onSubmit: (professional: Omit<Professional, 'id' | 'created_at'>) => void;
  /** Callback when back button is clicked */
  onBack: () => void;
  /** Initial data for the form */
  initialData?: Partial<Professional>;
}

/**
 * Interface for skill data
 */
interface Skill {
  id: number;
  nome: string;
  tipo: string;
}

/**
 * Form for creating or editing a professional
 * 
 * @example
 * ```tsx
 * <ProfessionalForm 
 *   onSubmit={handleSubmit} 
 *   onBack={handleBack} 
 * />
 * ```
 */
export const ProfessionalForm: React.FC<ProfessionalFormProps> = ({
  onSubmit,
  onBack,
  initialData = {},
  isLoading = false,
  className,
  testId,
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: initialData.nome_completo || '',
    email: initialData.email || '',
    area: initialData.area_atuacao || '',
    mainSkill: initialData.skill_principal || '',
    level: (initialData.nivel_experiencia as 'Júnior' | 'Pleno' | 'Sênior') || 'Júnior',
    disponivel_compartilhamento: initialData.disponivel_compartilhamento || false,
    percentual_compartilhamento: initialData.percentual_compartilhamento as '100' | '75' | '50' | '25' | null || null,
    gestor_area: initialData.gestor_area || '',
    gestor_direto: initialData.gestor_direto || ''
  });

  // UI state
  const [showSuccess, setShowSuccess] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillType, setNewSkillType] = useState('cargo');
  
  const skillTypes = ['cargo', 'linguagem', 'framework', 'cloud', 'banco', 'bi', 'devops', 'ciberseguranca', 'ia', 'blockchain'];

  // Load skills from Supabase
  useEffect(() => {
    const loadSkills = async () => {
      const { data } = await supabase.from('skills').select('*');
      if (data) {
        setSkills(data);
        
        // If we have initial data with outras_tecnologias, parse and set selected skills
        if (initialData.outras_tecnologias) {
          const skillsText = initialData.outras_tecnologias;
          const skillsList = skillsText.split(',').map(s => s.trim());
          
          const selectedSkillsFromData = skillsList
            .map(skillText => {
              const match = skillText.match(/^(.*?)\s*\((.*?)\)$/);
              if (match) {
                const [, nome, tipo] = match;
                const existingSkill = data.find(s => s.nome === nome && s.tipo === tipo);
                return existingSkill;
              }
              return null;
            })
            .filter(Boolean) as Skill[];
            
          setSelectedSkills(selectedSkillsFromData);
        }
      }
    };
    
    loadSkills();
  }, [initialData.outras_tecnologias]);

  /**
   * Handle skill selection
   */
  const handleSkillSelect = (skill: Skill) => {
    if (!selectedSkills.find(s => s.id === skill.id)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  /**
   * Handle skill removal
   */
  const handleSkillRemove = (id: number) => {
    setSelectedSkills(selectedSkills.filter(s => s.id !== id));
  };

  /**
   * Handle adding a new skill
   */
  const handleAddSkill = async () => {
    if (!newSkillName) return;
    
    const { data, error } = await supabase
      .from('skills')
      .insert([{ nome: newSkillName, tipo: newSkillType }])
      .select();
      
    if (data && data[0]) {
      setSkills([...skills, data[0]]);
      setSelectedSkills([...selectedSkills, data[0]]);
      setShowAddSkill(false);
      setNewSkillName('');
      setNewSkillType('cargo');
    } else {
      console.error('Error adding skill:', error);
      alert('Erro ao adicionar skill');
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.mainSkill || !formData.gestor_area || !formData.gestor_direto) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Create professional object from form data
    const professional: Omit<Professional, 'id' | 'created_at'> = {
      email: formData.email,
      nome_completo: formData.name,
      area_atuacao: formData.area,
      skill_principal: formData.mainSkill,
      nivel_experiencia: formData.level,
      hora_ultima_modificacao: new Date().toISOString(),
      regime: 'CLT',
      local_alocacao: null,
      proficiencia_cargo: null,
      java: null,
      javascript: null,
      python: null,
      typescript: null,
      php: null,
      dotnet: null,
      react: null,
      angular: null,
      ionic: null,
      flutter: null,
      mysql: null,
      postgres: null,
      oracle_db: null,
      sql_server: null,
      mongodb: null,
      aws: null,
      azure: null,
      gcp: null,
      outras_tecnologias: selectedSkills.map(s => `${s.nome} (${s.tipo})`).join(', '),
      android: null,
      cobol: null,
      linguagem_r: null,
      linguagem_c: null,
      linguagem_cpp: null,
      windows: null,
      raspberry_pi: null,
      arduino: null,
      disponivel_compartilhamento: formData.disponivel_compartilhamento,
      percentual_compartilhamento: formData.disponivel_compartilhamento ? formData.percentual_compartilhamento : null,
      gestor_area: formData.gestor_area,
      gestor_direto: formData.gestor_direto,
      gerencia_projetos: null,
      administracao_projetos: null,
      analise_requisitos: null
    };

    // Set skill level in the appropriate column
    const mainSkillColumn = SKILL_COLUMN_MAP[formData.mainSkill];
    if (mainSkillColumn && mainSkillColumn in professional) {
      (professional as any)[mainSkillColumn] = formData.level;
    }

    // Submit the form
    onSubmit(professional);

    // Show success message and redirect
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onBack();
    }, 2000);
  };

  // Success message component
  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 flex items-center justify-center z-50"
      >
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Check className="h-8 w-8 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">Profissional Cadastrado!</h3>
          <p className="text-slate-300">Redirecionando para o dashboard...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("max-w-2xl mx-auto", className)}
      data-testid={testId}
    >
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors mr-4"
            disabled={isLoading}
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <h2 className="text-3xl font-bold text-white">Cadastro Manual</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o nome completo"
              required
              disabled={isLoading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              E-mail *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="exemplo@email.com"
              required
              disabled={isLoading}
            />
          </div>

          {/* Compartilhamento */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="disponivel_compartilhamento"
                checked={formData.disponivel_compartilhamento}
                onChange={(e) => setFormData({ ...formData, disponivel_compartilhamento: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                disabled={isLoading}
              />
              <label htmlFor="disponivel_compartilhamento" className="text-sm font-medium text-slate-300">
                Disponível para Compartilhamento
              </label>
            </div>

            {formData.disponivel_compartilhamento && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Percentual de Compartilhamento
                </label>
                <select
                  value={formData.percentual_compartilhamento || ''}
                  onChange={(e) => setFormData({ ...formData, percentual_compartilhamento: e.target.value as '100' | '75' | '50' | '25' })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={formData.disponivel_compartilhamento}
                  disabled={isLoading}
                >
                  <option value="" className="bg-slate-800">Selecione o percentual</option>
                  <option value="100" className="bg-slate-800">100%</option>
                  <option value="75" className="bg-slate-800">75%</option>
                  <option value="50" className="bg-slate-800">50%</option>
                  <option value="25" className="bg-slate-800">25%</option>
                </select>
              </div>
            )}
          </div>

          {/* Área */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Área de Atuação
            </label>
            <select
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="" className="bg-slate-800">Selecione uma área</option>
              {AREAS.map(a => <option key={a} value={a} className="bg-slate-800">{a}</option>)}
            </select>
          </div>

          {/* Gestor da Área */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Gestor da Área *
            </label>
            <input
              type="text"
              value={formData.gestor_area}
              onChange={(e) => setFormData({ ...formData, gestor_area: e.target.value })}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>

          {/* Gestor Direto */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Gestor Direto *
            </label>
            <input
              type="text"
              value={formData.gestor_direto}
              onChange={(e) => setFormData({ ...formData, gestor_direto: e.target.value })}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>

          {/* Skill Principal */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Linguagem Principal *
            </label>
            <select
              value={formData.mainSkill}
              onChange={(e) => setFormData({ ...formData, mainSkill: e.target.value })}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            >
              <option value="" className="bg-slate-800">Selecione a linguagem principal</option>
              {MAIN_SKILLS.map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
            </select>
          </div>

          {/* Nível de Experiência */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nível de Experiência
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as 'Júnior' | 'Pleno' | 'Sênior' })}
              className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="Júnior" className="bg-slate-800">Júnior</option>
              <option value="Pleno" className="bg-slate-800">Pleno</option>
              <option value="Sênior" className="bg-slate-800">Sênior</option>
            </select>
          </div>

          {/* Skills/Cargos (Multi-seleção) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Skills/Cargos
            </label>
            <Command>
              <CommandInput
                placeholder="Buscar skill/cargo..."
                value={skillSearch}
                onValueChange={setSkillSearch}
                disabled={isLoading}
              />
              <CommandList>
                {skills.filter(skill => skill.nome.toLowerCase().includes(skillSearch.toLowerCase())).map(skill => (
                  <CommandItem
                    key={skill.id}
                    onSelect={() => handleSkillSelect(skill)}
                    className={selectedSkills.find(s => s.id === skill.id) ? 'bg-blue-100' : ''}
                  >
                    {skill.nome} <span className="ml-2 text-xs text-slate-400">({skill.tipo})</span>
                  </CommandItem>
                ))}
                <CommandEmpty>
                  Nenhum skill/cargo encontrado.<br />
                  <Button type="button" size="sm" onClick={() => setShowAddSkill(true)} className="mt-2" disabled={isLoading}>
                    Adicionar novo
                  </Button>
                </CommandEmpty>
              </CommandList>
            </Command>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedSkills.map(skill => (
                <span key={skill.id} className="bg-blue-600 text-white px-2 py-1 rounded flex items-center">
                  {skill.nome} <span className="ml-1 text-xs">({skill.tipo})</span>
                  <button 
                    type="button" 
                    className="ml-1" 
                    onClick={() => handleSkillRemove(skill.id)}
                    disabled={isLoading}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            {showAddSkill && (
              <div className="mt-2 bg-white/10 p-4 rounded-lg">
                <input
                  type="text"
                  placeholder="Nome do skill/cargo"
                  value={newSkillName}
                  onChange={e => setNewSkillName(e.target.value)}
                  className="w-full p-2 rounded mb-2"
                  disabled={isLoading}
                />
                <select
                  value={newSkillType}
                  onChange={e => setNewSkillType(e.target.value)}
                  className="w-full p-2 rounded mb-2"
                  disabled={isLoading}
                >
                  {skillTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                <Button 
                  type="button" 
                  onClick={handleAddSkill}
                  disabled={isLoading}
                >
                  Adicionar
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowAddSkill(false)} 
                  className="ml-2"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : 'Cadastrar Profissional'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default ProfessionalForm;