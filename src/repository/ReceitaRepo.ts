import { Op, Sequelize, Transaction, ValidationError } from "sequelize";
import { Receita } from "../models/Receita";
import HttpStatusCode from "../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";

//Interface para facil vizualização das funções existentes na classe.
interface IReceitaRepo {
  adicionar(
    receita: Receita,
    transaction: Transaction | null
  ): Promise<objetoDeComunicacao>;
  atualizar(receita: Receita): Promise<objetoDeComunicacao>;
  excluir(
    receitaId: number,
    transaction: Transaction | null
  ): Promise<objetoDeComunicacao>;
  obterPorId(receitaId: number): Promise<objetoDeComunicacao>;
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
      vendas: string;
    }
  ): Promise<objetoDeComunicacao>;
  // listarReceitasEfetuadas(body: Receita): Promise<objetoDeComunicacao>;
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

export class ReceitaRepo implements IReceitaRepo {
  async adicionar(
    receita: Receita,
    transaction: Transaction | null = null
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    const options = transaction ? { transaction } : {};
    try {
      //Cria a receita baseado nos dados recebidos. Caso algum dado opcional não seja recebido, é atribuido o valor NULL
      await Receita.create(
        {
          descricao: receita.descricao,
          valor: receita.valor,
          data: receita.data,
          usuario_id: receita.usuario_id,
          categoria_receita_id: receita.categoria_receita_id
            ? receita.categoria_receita_id
            : null,
          efetuado: receita.efetuado,
          cliente_id: receita.cliente_id ? receita.cliente_id : null,
          servico_id: receita.servico_id ? receita.servico_id : null,
          produto_id: receita.produto_id ? receita.produto_id : null,
          vendas_id: receita.vendas_id ? receita.vendas_id : null,
          anexo: receita.anexo ? receita.anexo : null,
          is_estoque: receita.is_estoque ? receita.is_estoque : false,
          //ativo: true,
        },
        options //caso seja enviado uma transação em bloco, em vez de unica
      );
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessCreated);
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      //if (transaction) await transaction.rollback(); //caso der erro, ja cancela a transação
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  // Função responsavel por atualizar a receita. De acordo com os dados recebidos, esses serão alterados.
  // Os dados não recebidos permanecerão os mesmos valores ja existentes no banco.
  async atualizar(receita: Receita): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const receitaExistente = await Receita.findByPk(receita.id);
      if (!receitaExistente) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      }

      if (!(receitaExistente.usuario_id == receita.usuario_id))
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorForbidden);

      // Todos os campos seguem a mesma ideia. Se o usuario não especificou o valor (undefined), ele atribui
      // o valor salvo no banco, caso contrario ele atribui o valor que o usuario enviou.
      receitaExistente.descricao =
        receita.descricao !== undefined
          ? receita.descricao
          : receitaExistente.descricao;

      receitaExistente.valor =
        receita.valor !== undefined ? receita.valor : receitaExistente.valor;

      receitaExistente.data =
        receita.data !== undefined ? receita.data : receitaExistente.data;

      receitaExistente.anexo =
        receita.anexo !== undefined ? receita.anexo : receitaExistente.anexo;

      receitaExistente.usuario_id = receitaExistente.usuario_id;

      receitaExistente.categoria_receita_id =
        receita.categoria_receita_id !== undefined
          ? receita.categoria_receita_id
          : receitaExistente.categoria_receita_id;

      (receitaExistente.efetuado =
        receita.efetuado !== undefined
          ? receita.efetuado
          : receitaExistente.efetuado),
        (receitaExistente.cliente_id =
          receita.cliente_id !== undefined
            ? receita.cliente_id
            : receitaExistente.cliente_id),
        (receitaExistente.servico_id =
          receita.servico_id !== undefined
            ? receita.servico_id
            : receitaExistente.servico_id),
        (receitaExistente.produto_id =
          receita.produto_id !== undefined
            ? receita.produto_id
            : receitaExistente.produto_id),
        (receitaExistente.vendas_id =
          receita.vendas_id !== undefined
            ? receita.vendas_id
            : receitaExistente.vendas_id),
        await receitaExistente.save();
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
    receitaId: number,
    transaction: Transaction | null = null
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    const options = transaction ? { transaction } : {};
    try {
      const receitaExistente: Receita | null = await Receita.findByPk(
        receitaId
      );

      if (!receitaExistente)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      // receitaExistente.ativo = !receitaExistente.ativo;
      // await receitaExistente.save();
      await receitaExistente.destroy(options);
      resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK);

      return resultado;
    } catch (error: unknown) {
      console.log(error);
      //if (transaction) await transaction.rollback(); //caso der erro, ja cancela a transação
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof ValidationError) {
        resultado.HttpConstruirRetorno(HttpStatusCode.ClientErrorBadRequest);
      } else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
      throw resultado;
    }
  }

  async obterPorId(receitaId: number): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const receita = await Receita.findByPk(receitaId);

      if (!receita)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        receita.dataValues
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
      vendas: string;
    }
  ): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      opcional.vendas = !opcional.vendas ? "undefined" : opcional.vendas;
      let receitas: Receita[] = await Receita.findAll({
        where: {
          usuario_id: usuarioId,
          efetuado:
            opcional.efetuado === "undefined"
              ? { [Op.any]: [true, false] }
              : //? { [Op.or]: [true, false] }
                { [Op.is]: JSON.parse(opcional.efetuado) },

          data:
            // Sequelize.literal("")

            // (dataInicio === 'undefined' && dataFim === 'undefined') ?
            // {[Op.not]: [null] }:
            // {[Op.gte]: [JSON.parse(dataFim)]}

            opcional.dataInicio === "undefined" &&
            opcional.dataFim === "undefined"
              ? Sequelize.literal(`"Receita"."data" IS NOT NULL`)
              : //{[Op.not]: [null] }
              opcional.dataInicio !== "undefined" &&
                opcional.dataFim !== "undefined"
              ? { [Op.between]: [opcional.dataInicio, opcional.dataFim] }
              : opcional.dataFim !== "undefined"
              ? //{ [Op.lte]: [opcional.dataFim] }
                Sequelize.literal(`"Receita"."data" <= '${opcional.dataFim}'`)
              : //{ [Op.gte]: [opcional.dataInicio] },
                Sequelize.literal(
                  `"Receita"."data" >= '${opcional.dataInicio}'`
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

          categoria_receita_id:
            opcional.categoria === "undefined"
              ? Sequelize.literal(``)
              : opcional.categoria,

          vendas_id:
            opcional.vendas === "undefined"
              ? Sequelize.literal(``)
              : opcional.vendas,
        },
        order: [
          ["data", "DESC"],
          ["id", "DESC"],
        ],
      });

      resultado.HttpConstruirRetorno(
        HttpStatusCode.SuccessOK,
        receitas.map((data) => {
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
      const { count, rows } = await Receita.findAndCountAll({
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
              ? Sequelize.literal(`"Receita"."data" IS NOT NULL`)
              : //{[Op.not]: [null] }
              opcional.dataInicio !== "undefined" &&
                opcional.dataFim !== "undefined"
              ? { [Op.between]: [opcional.dataInicio, opcional.dataFim] }
              : opcional.dataFim !== "undefined"
              ? //{ [Op.lte]: [opcional.dataFim] }
                Sequelize.literal(`"Receita"."data" <= '${opcional.dataFim}'`)
              : //{ [Op.gte]: [opcional.dataInicio] },
                Sequelize.literal(
                  `"Receita"."data" >= '${opcional.dataInicio}'`
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

          categoria_receita_id:
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

      //return rows;
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
