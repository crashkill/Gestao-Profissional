import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, Check } from 'lucide-react';
import { Professional, AREAS, MAIN_SKILLS, OTHER_SKILLS, SKILL_COLUMN_MAP } from '../types/Professional';

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
    otherSkills: [] as Array<{ name: string; level: 'Júnior' | 'Pleno' | 'Sênior' }>,
    disponivel_compartilhamento: false,
    percentual_compartilhamento: null as '100' | '75' | '50' | '25' | null
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const [currentLevel, setCurrentLevel] = useState<'Júnior' | 'Pleno' | 'Sênior'>('Júnior');
  const [showSuccess, setShowSuccess] = useState(false);



  const addSkill = () => {
    if (currentSkill && !formData.otherSkills.find(s => s.name === currentSkill)) {
      setFormData({
        ...formData,
        otherSkills: [...formData.otherSkills, { name: currentSkill, level: currentLevel }]
      });
      setCurrentSkill('');
      setCurrentLevel('Júnior');
    }
  };

  const removeSkill = (skillName: string) => {
    setFormData({
      ...formData,
      otherSkills: formData.otherSkills.filter(s => s.name !== skillName)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.mainSkill) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

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
      outras_tecnologias: null,
      android: null,
      cobol: null,
      linguagem_r: null,
      linguagem_c: null,
      linguagem_cpp: null,
      windows: null,
      raspberry_pi: null,
      arduino: null,
      disponivel_compartilhamento: formData.disponivel_compartilhamento,
      percentual_compartilhamento: formData.disponivel_compartilhamento ? formData.percentual_compartilhamento : null
    };

    const mainSkillColumn = SKILL_COLUMN_MAP[formData.mainSkill];
    if (mainSkillColumn && mainSkillColumn in professional) {
      (professional as any)[mainSkillColumn] = formData.level;
    }

    formData.otherSkills.forEach(skill => {
      const skillColumn = SKILL_COLUMN_MAP[skill.name];
      if (skillColumn && skillColumn in professional) {
        (professional as any)[skillColumn] = skill.level;
      } else {
        const currentOtherTechs = professional.outras_tecnologias || '';
        const newTech = `${skill.name} - ${skill.level}`;
        professional.outras_tecnologias = currentOtherTechs 
          ? `${currentOtherTechs}, ${newTech}`
          : newTech;
      }
    });

    onSubmit(professional);

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onBack();
    }, 2000);
  };

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
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors mr-4"
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
            >
              <option value="" className="bg-slate-800">Selecione uma área</option>
              {AREAS.map(a => <option key={a} value={a} className="bg-slate-800">{a}</option>)}
            </select>
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
            >
              <option value="Júnior" className="bg-slate-800">Júnior</option>
              <option value="Pleno" className="bg-slate-800">Pleno</option>
              <option value="Sênior" className="bg-slate-800">Sênior</option>
            </select>
          </div>

          {/* Outras Skills */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Outras Skills
            </label>
            <div className="flex gap-2 mb-3">
              <select
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                className="flex-1 p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="bg-slate-800">Selecione uma skill</option>
                {OTHER_SKILLS.filter(skill => !formData.otherSkills.find(s => s.name === skill)).map((skill) => (
                  <option key={skill} value={skill} className="bg-slate-800">{skill}</option>
                ))}
              </select>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value as 'Júnior' | 'Pleno' | 'Sênior')}
                className="p-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Júnior" className="bg-slate-800">Júnior</option>
                <option value="Pleno" className="bg-slate-800">Pleno</option>
                <option value="Sênior" className="bg-slate-800">Sênior</option>
              </select>
              <button
                type="button"
                onClick={addSkill}
                className="p-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Skills Adicionadas */}
            <div className="flex flex-wrap gap-2">
              {formData.otherSkills.map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm"
                >
                  <span>{skill.name} ({skill.level})</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill.name)}
                    className="hover:bg-purple-500/30 rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Cadastrar Profissional
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default ManualForm;
