const express = require('express')
const router = express.Router()

const LanchoneteService = require('../services/lanchoneteService')
const HorarioFuncionamentoService = require('../services/horarioFuncionamentoService')
const { verificarToken } = require('../middleware/authMiddleware')
const lanchoneteService = new LanchoneteService()

const horarioFuncionamentoService = new HorarioFuncionamentoService()

router.get('/lanchonete', async (req, res) => {
    try {
        const lanchonetes = await lanchoneteService.listarLanchonetes()
        return res.status(200).json(lanchonetes)
    } catch (error) {
        return res.status(500).json({ error: `Erro ao buscar lanchonetes: ${error}`})
    }
})
router.get('/lanchonete/:id', async (req, res) => {
    const { id } = req.params
    try {
        const lanchonete = await lanchoneteService.buscarLanchonete(id)
        return res.status(200).json(lanchonete)
    } catch (error) {
        return res.status(500).json({ error: `Erro ao buscar lanchonete: ${error}`})
    }
})

router.post('/lanchonete/:id/horario', /*verificarToken('gerente'),*/ async(req, res)=> {
    const { id } = req.params
    const {diaSemana, horarioAbertura, horarioFechamento} = req.body

    const diasValidos = ['DOM', 'SEG-SEX', 'SAB'];
    if (!diasValidos.includes(diaSemana)) {
        return res.status(400).json({ error: 'Dia da semana inválido' });
    }

    try {
        const horario = await horarioFuncionamentoService.adicionarHorario(id, diaSemana, horarioAbertura, horarioFechamento)
        return res.status(201).json({ message: `Horario adicionado com sucesso`, horario})
    } catch (error) {
        return res.status(500).json({ error: `Erro ao adicionar horario: ${error}`})
    }
})

router.get('/lanchonete/:id/horarios', async (req, res) => {
    const { id } = req.params;

    try {
        const horarios = await horarioFuncionamentoService.listarHorariosDeFuncionamento(id);
        return res.status(200).json(horarios);
    } catch (error) {
        return res.status(500).json({ error: `Erro ao listar horários de funcionamento: ${error.message}` });
    }
});

router.delete('/lanchonete/:id/horario/:horarioId', /*verificarToken('gerente'),*/ async (req, res) => {
    const { id, horarioId } = req.params;

    try {
        await horarioFuncionamentoService.deletarHorario(id, horarioId);
        return res.status(200).json({ message: 'Horário deletado com sucesso' });
    } catch (error) {
        return res.status(500).json({ error: `Erro ao deletar horário: ${error.message}` });
    }
});




module.exports = router