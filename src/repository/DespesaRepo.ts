import {
  Op,
  Sequelize,
  ValidationError,
  QueryTypes,
  Transaction,
} from "sequelize";
import { Despesa } from "../models/Despesa";
import HttpStatusCode from "../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";

interface IDespesaRepo {
  adicionar(
    despesa: Despesa,
    transaction: Transaction | null
  ): Promise<objetoDeComunicacao>;
  atualizar(despesa: Despesa): Promise<objetoDeComunicacao>;
  excluir(
    despesaId: number,
    transaction: Transaction | null
  ): Promise<objetoDeComunicacao>;
  obterPorId(despesaId: number): Promise<objetoDeComunicacao>;
  listarTodas(
    usuarioId: string,
    opcional: {
      efetuado: string;
      dataInicio: string;
      dataFim: string;
      cliente: string;
      produto: string;
      servico: string;
      categoria: string;
    }
  ): Promise<objetoDeComunicacao>;
  // listarDespesasEfetuadas(body: Despesa): Promise<objetoDeComunicacao>;
  paginacao(
    quantidade: number,
    pagina: number,
    opcional: {
      efetuado: string;
      dataInicio: string;
      dataFim: string;
      cliente: string;
      produto: string;
      servico: string;
      categoria: string;
    },
    usuarioId: string
  ): Promise<objetoDeComunicacao>;
}

export class DespesaRepo implements IDespesaRepo {
  async adicionar(
    despesa: Despesa,
    transaction: Transaction | null = null
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    const options = transaction ? { transaction } : {};
    try {
      await Despesa.create(
        {
          descricao: despesa.descricao,
          valor: despesa.valor,
          data: despesa.data,
          usuario_id: despesa.usuario_id,
          categoria_despesa_id: despesa.categoria_despesa_id
            ? despesa.categoria_despesa_id
            : null, //verificar se pode ser nulo
          efetuado: despesa.efetuado,
          cliente_id: despesa.cliente_id ? despesa.cliente_id : null,
          servico_id: despesa.servico_id ? despesa.servico_id : null,
          produto_id: despesa.produto_id ? despesa.produto_id : null,
          estoque_id: despesa.estoque_id ? despesa.estoque_id : null,
          anexo: despesa.anexo ? despesa.anexo : null,
        },
        options
      );
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessCreated);
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async atualizar(despesa: Despesa): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const despesaExistente = await Despesa.findByPk(despesa.id);
      if (!despesaExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }

      if (!(despesaExistente.usuario_id == despesa.usuario_id))
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorForbidden);

      despesaExistente.descricao =
        despesa.descricao !== undefined
          ? despesa.descricao
          : despesaExistente.descricao;

      despesaExistente.valor =
        despesa.valor !== undefined ? despesa.valor : despesaExistente.valor;

      despesaExistente.data =
        despesa.data !== undefined ? despesa.data : despesaExistente.data;

      despesaExistente.anexo =
        despesa.anexo !== undefined ? despesa.anexo : despesaExistente.anexo;

      despesaExistente.usuario_id = despesaExistente.usuario_id;

      despesaExistente.categoria_despesa_id =
        despesa.categoria_despesa_id !== undefined
          ? despesa.categoria_despesa_id
          : despesaExistente.categoria_despesa_id;

      (despesaExistente.efetuado =
        despesa.efetuado !== undefined
          ? despesa.efetuado
          : despesaExistente.efetuado),
        (despesaExistente.cliente_id =
          despesa.cliente_id !== undefined
            ? despesa.cliente_id
            : despesaExistente.cliente_id),
        (despesaExistente.servico_id =
          despesa.servico_id !== undefined
            ? despesa.servico_id
            : despesaExistente.servico_id),
        (despesaExistente.produto_id =
          despesa.produto_id !== undefined
            ? despesa.produto_id
            : despesaExistente.produto_id),
        await despesaExistente.save();
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK);
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async excluir(
    despesaId: number,
    transaction: Transaction | null = null
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    const options = transaction ? { transaction } : {};
    try {
      const despesaExistente = await Despesa.findByPk(despesaId);

      if (!despesaExistente)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      await despesaExistente.destroy(options);
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK);

      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async obterPorId(despesaId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const despesa = await Despesa.findByPk(despesaId);

      if (!despesa)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        despesa.dataValues
      );
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async listarTodas(
    usuarioId: string,
    opcional: {
      efetuado: string;
      dataInicio: string;
      dataFim: string;
      cliente: string;
      produto: string;
      servico: string;
      categoria: string;
      estoque: string;
    }
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      opcional.estoque = !opcional.estoque ? "undefined" : opcional.estoque;
      let despesas: Despesa[] = await Despesa.findAll({
        where: {
          usuario_id: usuarioId,
          efetuado:
            opcional.efetuado === "undefined"
              ? { [Op.any]: [true, false] }
              : //? { [Op.or]: [true, false] }
                { [Op.is]: JSON.parse(opcional.efetuado) },
          data:
            opcional.dataInicio === "undefined" &&
            opcional.dataFim === "undefined"
              ? Sequelize.literal(`"Despesa"."data" IS NOT NULL`)
              : //{[Op.not]: [null] }
              opcional.dataInicio !== "undefined" &&
                opcional.dataFim !== "undefined"
              ? { [Op.between]: [opcional.dataInicio, opcional.dataFim] }
              : opcional.dataFim !== "undefined"
              ? //{ [Op.lte]: [opcional.dataFim] }
                Sequelize.literal(`"Despesa"."data" <= '${opcional.dataFim}'`)
              : //{ [Op.gte]: [opcional.dataInicio] },
                Sequelize.literal(
                  `"Despesa"."data" >= '${opcional.dataInicio}'`
                ),
          cliente_id:
            opcional.cliente === "undefined"
              ? Sequelize.literal(``)
              : opcional.cliente,

          produto_id:
            opcional.produto === "undefined"
              ? Sequelize.literal(``)
              : opcional.produto,

          servico_id:
            opcional.servico === "undefined"
              ? Sequelize.literal(``)
              : opcional.servico,

          categoria_despesa_id:
            opcional.categoria === "undefined"
              ? Sequelize.literal(``)
              : opcional.categoria,

          estoque_id:
            opcional.estoque === "undefined"
              ? Sequelize.literal(``)
              : opcional.estoque,
        },
        order: [
          ["data", "DESC"],
          ["id", "DESC"],
        ],
      });
      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        despesas.map((data) => {
          return data.dataValues;
        })
      );

      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async paginacao(
    quantidade: number,
    pagina: number,
    opcional: {
      efetuado: string;
      dataInicio: string;
      dataFim: string;
      cliente: string;
      produto: string;
      servico: string;
      categoria: string;
    },
    usuarioId: string
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const { count, rows } = await Despesa.findAndCountAll({
        where: {
          usuario_id: usuarioId,
          efetuado:
            opcional.efetuado === "undefined"
              ? { [Op.any]: [true, false] }
              : //? { [Op.or]: [true, false] }
                { [Op.is]: JSON.parse(opcional.efetuado) },
          data:
            opcional.dataInicio === "undefined" &&
            opcional.dataFim === "undefined"
              ? Sequelize.literal(`"Despesa"."data" IS NOT NULL`)
              : //{[Op.not]: [null] }
              opcional.dataInicio !== "undefined" &&
                opcional.dataFim !== "undefined"
              ? { [Op.between]: [opcional.dataInicio, opcional.dataFim] }
              : opcional.dataFim !== "undefined"
              ? //{ [Op.lte]: [opcional.dataFim] }
                Sequelize.literal(`"Despesa"."data" <= '${opcional.dataFim}'`)
              : //{ [Op.gte]: [opcional.dataInicio] },
                Sequelize.literal(
                  `"Despesa"."data" >= '${opcional.dataInicio}'`
                ),
          cliente_id:
            opcional.cliente === "undefined"
              ? Sequelize.literal(``)
              : opcional.cliente,

          produto_id:
            opcional.produto === "undefined"
              ? Sequelize.literal(``)
              : opcional.produto,

          servico_id:
            opcional.servico === "undefined"
              ? Sequelize.literal(``)
              : opcional.servico,

          categoria_despesa_id:
            opcional.categoria === "undefined"
              ? Sequelize.literal(``)
              : opcional.categoria,
        },
        order: [
          ["data", "DESC"],
          ["id", "DESC"],
        ],
        offset: quantidade * pagina,
        limit: quantidade,
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        rows.map((data) => {
          return data.dataValues;
        }),
        `${count}`
      );
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async parcelasValores(usuarioId: string): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      if (!Despesa.sequelize) {
        throw new Error("Sequelize não está definido em Estoque");
      }
      const query = `
        SELECT COUNT(id) AS parcelas, SUM(valor) as valor_a_pagar
        FROM despesa
        WHERE despesa.usuario_id = :usuarioId AND despesa.efetuado = false AND despesa.produto_id IS NOT NULL
      `;
      //WHERE despesa.usuario_id = :usuarioId AND despesa.efetuado = false AND despesa.is_estoque = true

      const valores = {
        usuarioId: usuarioId,
      };

      const [resultadoQuery] = await Despesa.sequelize.query<{
        parcelas: number;
        valor_a_pagar: number;
      }>(query, {
        replacements: valores,
        type: QueryTypes.SELECT,
      });

      const parcelas: number = resultadoQuery?.parcelas || 0;
      const total_a_pagar: number = resultadoQuery?.valor_a_pagar || 0;

      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, {
        parcelas,
        total_a_pagar,
      });

      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }
}
