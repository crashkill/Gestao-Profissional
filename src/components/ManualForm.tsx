import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, Check } from 'lucide-react';
import { Professional, AREAS, MAIN_SKILLS, OTHER_SKILLS, SKILL_COLUMN_MAP } from '../types/Professional';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from './ui/command';
import { Button } from './ui/button';
import { PageHeader, SuccessScreen, useFeedback, FeedbackSystem } from './ui';
import { supabase } from '../lib/supabaseClient';

interface ManualFormProps {
  onSubmit: (professional: Omit<Professional, 'id' | 'created_at'>) => void;
  onBack: () => void;
}

const ManualForm: React.FC<ManualFormProps> = ({ onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    area: '',
    mainSkill: '',
    level: 'Júnior' as 'Júnior' | 'Pleno' | 'Sênior',
    disponivel_compartilhamento: false,
    percentual_compartilhamento: null as '100' | '75' | '50' | '25' | null,
    gestor_area: '',
    gestor_direto: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [skills, setSkills] = useState<{ id: number; nome: string; tipo: string }[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<{ id: number; nome: string; tipo: string }[]>([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillType, setNewSkillType] = useState('cargo');
  const skillTypes = ['cargo', 'linguagem', 'framework', 'cloud', 'banco', 'bi', 'devops', 'ciberseguranca', 'ia', 'blockchain'];
  const { feedback, showFeedback, hideFeedback } = useFeedback();

  useEffect(() => {
    supabase.from('skills').select('*').then(({ data }) => {
      if (data) setSkills(data);
    });
  }, []);

  const handleSkillSelect = (skill: { id: number; nome: string; tipo: string }) => {
    if (!selectedSkills.find(s => s.id === skill.id)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSkillRemove = (id: number) => {
    setSelectedSkills(selectedSkills.filter(s => s.id !== id));
  };

  const handleAddSkill = async () => {
    if (!newSkillName) return;
    const { data, error } = await supabase.from('skills').insert([{ nome: newSkillName, tipo: newSkillType }]).select();
    if (data && data[0]) {
      setSkills([...skills, data[0]]);
      setSelectedSkills([...selectedSkills, data[0]]);
      setShowAddSkill(false);
      setNewSkillName('');
      setNewSkillType('cargo');
    } else {
      alert('Erro ao adicionar skill');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.mainSkill || !formData.gestor_area || !formData.gestor_direto) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const professional: Omit<Professional, 'id' | 'created_at'> = {
      email: formData.email,
      nome_completo: formData.name,
      area_atuacao: formData.area,
      skill_principal: formData.mainSkill,
      nivel_experiencia: formData.level,
      disponivel_compartilhamento: formData.disponivel_compartilhamento,
      percentual_compartilhamento: formData.disponivel_compartilhamento ? Number(formData.percentual_compartilhamento) : null,
      gestor_area: formData.gestor_area,
      gestor_direto: formData.gestor_direto
    };

    const mainSkillColumn = SKILL_COLUMN_MAP[formData.mainSkill];
    if (mainSkillColumn && mainSkillColumn in professional) {
      (professional as any)[mainSkillColumn] = formData.level;
    }

    onSubmit(professional);

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onBack();
    }, 2000);
  };

  if (showSuccess) {
    return (
      <SuccessScreen
        title="Profissional Cadastrado!"
        message="O profissional foi adicionado com sucesso ao sistema."
        buttonText="Voltar ao Dashboard"
        onButtonClick={onBack}
        autoRedirect={true}
        redirectDelay={2000}
        stats={[
          { label: "Nome", value: formData.name },
          { label: "Email", value: formData.email },
          { label: "Área", value: formData.area || "Não informado" }
        ]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <PageHeader
        title="Cadastro Manual"
        description="Adicione um novo profissional ao sistema"
        onBack={onBack}
        showBackButton={true}
      />

      <main className="max-w-4xl mx-auto px-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-2xl"
        >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-slate-700/70"
              placeholder="Digite o nome completo"
              required
            />
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              E-mail *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-slate-700/70"
              placeholder="exemplo@email.com"
              required
            />
          </motion.div>

          {/* Compartilhamento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
              <input
                type="checkbox"
                id="disponivel_compartilhamento"
                checked={formData.disponivel_compartilhamento}
                onChange={(e) => setFormData({ ...formData, disponivel_compartilhamento: e.target.checked })}
                className="w-5 h-5 rounded border-slate-500 bg-slate-700/50 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 transition-all duration-300"
              />
              <label htmlFor="disponivel_compartilhamento" className="text-sm font-semibold text-slate-200">
                Disponível para Compartilhamento
              </label>
            </div>

            {formData.disponivel_compartilhamento && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  Percentual de Compartilhamento
                </label>
                <select
                  value={formData.percentual_compartilhamento || ''}
                  onChange={(e) => setFormData({ ...formData, percentual_compartilhamento: e.target.value as '100' | '75' | '50' | '25' })}
                  className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-slate-700/70"
                  required={formData.disponivel_compartilhamento}
                >
                  <option value="" className="bg-slate-800">Selecione o percentual</option>
                  <option value="100" className="bg-slate-800">100%</option>
                  <option value="75" className="bg-slate-800">75%</option>
                  <option value="50" className="bg-slate-800">50%</option>
                  <option value="25" className="bg-slate-800">25%</option>
                </select>
              </motion.div>
            )}
          </motion.div>

          {/* Área */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              Área de Atuação
            </label>
            <select
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-slate-700/70"
            >
              <option value="" className="bg-slate-800">Selecione uma área</option>
              {AREAS.map(a => <option key={a} value={a} className="bg-slate-800">{a}</option>)}
            </select>
          </motion.div>

          {/* Gestor da Área */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              Gestor da Área *
            </label>
            <input
              type="text"
              value={formData.gestor_area}
              onChange={(e) => setFormData({ ...formData, gestor_area: e.target.value })}
              className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-slate-700/70"
              placeholder="Nome do gestor da área"
              required
            />
          </motion.div>

          {/* Gestor Direto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              Gestor Direto *
            </label>
            <input
              type="text"
              value={formData.gestor_direto}
              onChange={(e) => setFormData({ ...formData, gestor_direto: e.target.value })}
              className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-slate-700/70"
              placeholder="Nome do gestor direto"
              required
            />
          </motion.div>

          {/* Skill Principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              Linguagem/Tecnologia Principal *
            </label>
            <input
              type="text"
              value={formData.mainSkill}
              onChange={(e) => setFormData({ ...formData, mainSkill: e.target.value })}
              className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-slate-700/70"
              placeholder="Ex: JavaScript, Python, Java..."
              required
            />
          </motion.div>

          {/* Nível de Experiência */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.5 }}
          >
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              Nível de Experiência *
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as 'Júnior' | 'Pleno' | 'Sênior' })}
              className="w-full p-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-slate-700/70"
              required
            >
              <option value="" className="bg-slate-800">Selecione o nível</option>
              <option value="Júnior" className="bg-slate-800">Júnior</option>
              <option value="Pleno" className="bg-slate-800">Pleno</option>
              <option value="Sênior" className="bg-slate-800">Sênior</option>
              <option value="Especialista" className="bg-slate-800">Especialista</option>
            </select>
          </motion.div>

          {/* Skills/Cargos (Multi-seleção) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.5 }}
          >
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              Skills/Cargos
            </label>
            <div className="relative">
              <Command className="bg-slate-700/50 border border-slate-600/50 rounded-xl">
                <CommandInput
                  placeholder="Buscar skill/cargo..."
                  value={skillSearch}
                  onValueChange={setSkillSearch}
                  className="bg-transparent text-white placeholder-slate-400 p-4"
                />
                <CommandList className="max-h-40 overflow-y-auto">
                  <CommandEmpty className="text-slate-400 p-4">
                    Nenhum skill/cargo encontrado.<br />
                    <Button type="button" size="sm" onClick={() => setShowAddSkill(true)} className="mt-2">Adicionar novo</Button>
                  </CommandEmpty>
                  {skills.filter(skill => skill.nome.toLowerCase().includes(skillSearch.toLowerCase())).map(skill => (
                    <CommandItem
                      key={skill.id}
                      onSelect={() => handleSkillSelect(skill)}
                      className={`text-white hover:bg-slate-600/50 cursor-pointer p-3 transition-colors duration-200 ${selectedSkills.find(s => s.id === skill.id) ? 'bg-purple-600/30' : ''}`}
                    >
                      {skill.nome} <span className="ml-2 text-xs text-slate-400">({skill.tipo})</span>
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </div>

            {/* Skills Selecionadas */}
            {selectedSkills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4"
              >
                <p className="text-sm font-medium text-slate-200 mb-3">Skills selecionadas:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map(skill => (
                    <motion.span
                      key={skill.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-sm font-medium shadow-lg"
                    >
                      {skill.nome} <span className="ml-1 text-xs">({skill.tipo})</span>
                      <button
                        type="button"
                        onClick={() => handleSkillRemove(skill.id)}
                        className="hover:bg-white/20 rounded-full p-1 transition-colors duration-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Adicionar Nova Skill */}
            {showAddSkill && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-4 bg-slate-700/30 p-4 rounded-xl border border-slate-600/30"
              >
                <input
                  type="text"
                  placeholder="Nome do skill/cargo"
                  value={newSkillName}
                  onChange={e => setNewSkillName(e.target.value)}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 mb-3"
                />
                <select
                  value={newSkillType}
                  onChange={e => setNewSkillType(e.target.value)}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 mb-3"
                >
                  {skillTypes.map(type => <option key={type} value={type} className="bg-slate-800">{type}</option>)}
                </select>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 shadow-lg"
                  >
                    Adicionar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddSkill(false)}
                    className="px-4 py-2 bg-slate-600/50 hover:bg-slate-600/70 text-white rounded-xl transition-all duration-300"
                  >
                    Cancelar
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.5 }}
            className="pt-8"
          >
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Cadastrar Profissional
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </main>
    <FeedbackSystem feedback={feedback} onClose={hideFeedback} />
  </div>
  );
};

export default ManualForm;