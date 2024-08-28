import { Request } from "express";
import HttpStatusCode from "./HttpStatusCodes";
import { objetoDeComunicacao } from "./ObjetoDeComunicacao";

const bcrypt = require("bcrypt");
const SALT = Number(process.env.SALT);

export function senhaHash(senha: string): string {
  senha = bcrypt.hashSync(senha, SALT);

  return senha;
}

export function senhaComparar(senha: string, hash: string): boolean {
  return bcrypt.compareSync(senha, hash);
}

export function validacaoBuscasOpcionaisReceitaEDespesa(
  efetuado: string,
  opcionais: {
    dataInicio?: string;
    dataFim?: string;
    cliente?: string;
    produto?: string;
    servico?: string;
    categoria?: string;
  }
): objetoDeComunicacao {
  if (efetuado === undefined || efetuado === "")
    efetuado = "undefined"; //efetuado = "undefined";
  else if (efetuado.toLocaleUpperCase() === "SIM") efetuado = "true";
  else if (efetuado.toLocaleUpperCase() === "NAO") efetuado = "false";
  else
    return new objetoDeComunicacao(
      HttpStatusCode.ClientErrorBadRequest,
      {},
      "Efetuado invalido."
    );

  if (opcionais.dataInicio === undefined || opcionais.dataInicio === "")
    opcionais.dataInicio = "undefined"; //efetuado = "undefined";
  else if (RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/).test(opcionais.dataInicio))
    opcionais.dataInicio = opcionais.dataInicio;
  else
    return new objetoDeComunicacao(
      HttpStatusCode.ClientErrorBadRequest,
      {},
      "Data inicio invalido."
    );

  if (opcionais.dataFim === undefined || opcionais.dataFim === "")
    opcionais.dataFim = "undefined"; //efetuado = "undefined";
  else if (RegExp(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/).test(opcionais.dataFim))
    opcionais.dataFim = opcionais.dataFim;
  else
    return new objetoDeComunicacao(
      HttpStatusCode.ClientErrorBadRequest,
      {},
      "Data fim invalida."
    );

  if (opcionais.cliente === undefined || opcionais.cliente === "")
    opcionais.cliente = "undefined";
  else if (!isNaN(+opcionais.cliente)) opcionais.cliente = opcionais.cliente;
  else
    return new objetoDeComunicacao(
      HttpStatusCode.ClientErrorBadRequest,
      {},
      "Cliente invalido."
    );

  if (opcionais.produto === undefined || opcionais.produto === "")
    opcionais.produto = "undefined";
  else if (!isNaN(+opcionais.produto)) opcionais.produto = opcionais.produto;
  else
    return new objetoDeComunicacao(
      HttpStatusCode.ClientErrorBadRequest,
      {},
      "Produto invalido."
    );

  if (opcionais.servico === undefined || opcionais.servico === "")
    opcionais.servico = "undefined";
  else if (!isNaN(+opcionais.servico)) opcionais.servico = opcionais.servico;
  else
    return new objetoDeComunicacao(
      HttpStatusCode.ClientErrorBadRequest,
      {},
      "Servico invalido."
    );

  if (opcionais.categoria === undefined || opcionais.categoria === "")
    opcionais.categoria = "undefined";
  else if (!isNaN(+opcionais.categoria))
    opcionais.categoria = opcionais.categoria;
  else
    return new objetoDeComunicacao(
      HttpStatusCode.ClientErrorBadRequest,
      {},
      "Categoria invalida."
    );

  return new objetoDeComunicacao(HttpStatusCode.SuccessOK, {
    efetuado: efetuado,
    dataInicio: opcionais.dataInicio,
    dataFim: opcionais.dataFim,
    cliente: opcionais.cliente,
    produto: opcionais.produto,
    servico: opcionais.servico,
    categoria: opcionais.categoria,
  });
}
