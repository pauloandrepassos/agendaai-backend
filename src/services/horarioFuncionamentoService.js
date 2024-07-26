const HorarioFuncionamentoModel = require("../models/horarioFuncionamento");

class HorarioFuncionamentoService {
    async adicionarHorario(idLanchonete, diaSemana, horarioAbertura, horarioFechamento) {
        console.log(idLanchonete, diaSemana, horarioAbertura, horarioFechamento)
        const horariosExistentes = await HorarioFuncionamentoModel.findAll({
            where: {
                idLanchonete,
                diaSemana
            }
        });

        for (const horario of horariosExistentes) {
            if (
                (horarioAbertura >= horario.horarioAbertura && horarioAbertura <= horario.horarioFechamento) ||
                (horarioFechamento >= horario.horarioAbertura && horarioFechamento <= horario.horarioFechamento) ||
                (horarioAbertura <= horario.horarioAbertura && horarioFechamento >= horario.horarioFechamento)
            ) {
                throw new Error(`Conflito de horário: ${horario.diaSemana} ${horario.horarioAbertura} - ${horario.horarioFechamento}`);
            }
        }
        try {
            const horario = await HorarioFuncionamentoModel.create({
                idLanchonete: idLanchonete,
                diaSemana: diaSemana,
                horarioAbertura: horarioAbertura,
                horarioFechamento: horarioFechamento
            });
            return horario;
        } catch (error) {
            throw error;
        }
    }
    async listarHorariosDeFuncionamento(idLanchonete) {
        try {
            const horarios = await HorarioFuncionamentoModel.findAll({
                where: { idLanchonete }
            });
            return horarios;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = HorarioFuncionamentoService