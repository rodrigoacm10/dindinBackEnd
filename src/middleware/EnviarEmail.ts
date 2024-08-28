import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
//var jwt = require("jsonwebtoken");
import { UsuarioRepo } from "../repository/usuario/UsuarioRepo";
import * as dotenv from "dotenv";
import HttpStatusCode from "../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";
import nodemailer from "nodemailer";
import { gerarToken } from "./Autenticacao";

dotenv.config();

export const enviarEmail = async (req: Request, res: Response) => {
  var resultado: objetoDeComunicacao = new objetoDeComunicacao(
    HttpStatusCode.ServerErrorInternal
  );
  try {
    //Exemplos enviar email
    //https://www.youtube.com/watch?v=2noQO99PNEI
    //https://www.cloudmailin.com/blog/sending_and_receiving_email_in_node_2021

    console.log(req.body);
    if (!req.body.email)
      throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

    const usuario = await new UsuarioRepo().obterPorLogin(req.body.email);

    if (!usuario)
      throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_LOGIN as string,
        pass: process.env.EMAIL_PASSWORD as string,
      },
    });

    let token: string = jwt.sign(
      {
        usuario_id: usuario.data.usuario_id,
        email: req.body.email,
      },
      process.env.JWT_SEGREDO!,
      {
        expiresIn: "2h",
      }
    );

    console.log(token);
    const decoded = jwt.verify(token, process.env.JWT_SEGREDO as string);
    console.log(decoded);

    let text: string = `
    <a href=${process.env.ENDERECO_SITE}/esqueceusenha/recuperar?token=${token}>Clique Aqui para recuperar sua senha</a> Esse link é valido por 2h.`;

    const email_opcoes = {
      from: process.env.EMAIL_LOGIN as string,
      to: req.body.email as string,
      subject: "Alterar a senha - Dindin no bolso",
      // text: text,
      html: text,
    };

    let resposta = await transporter.sendMail(email_opcoes);
    console.log(resposta);

    resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK);
  } catch (error: unknown) {
    console.log(error);
    if (error instanceof objetoDeComunicacao) resultado = error;
    else
      resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
  } finally {
    return res.status(resultado.header).json(resultado.toJSON());
  }
};
