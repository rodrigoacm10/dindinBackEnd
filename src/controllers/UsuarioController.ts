import { Request, Response } from "express";
import { Usuario } from "../models/Usuario";
import { UsuarioRepo } from "../repository/usuario/UsuarioRepo";
import {
  BD_USUARIO_CATEGORIA_CONTA,
  BD_USUARIO_NIVEL_ACESSO,
} from "../utils/Constantes";
import HttpStatusCode from "../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";
import UsuarioCPFController from "./usuario/UsuarioCPFController";
import UsuarioCNPJController from "./usuario/UsuarioCNPJController";
import UsuarioADMINController from "./usuario/UsuarioADMINController";
import { senhaHash } from "../utils/FuncoesUteis";
import * as jwt from "jsonwebtoken";

class UsuarioController {
  static categoriaUsuario(
    categoriaUsuario: string,
    nivelAcessoUsuario: string
  ) {
    if (nivelAcessoUsuario.toLocaleUpperCase() == "ADMIN") {
      return UsuarioADMINController;
    } else if (categoriaUsuario.toLocaleUpperCase() == "CPF") {
      return UsuarioCPFController;
    } else if (categoriaUsuario.toLocaleUpperCase() == "CNPJ") {
      return UsuarioCNPJController;
    } else {
      return false;
    }
  }

  async adicionar(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      //Checa se a categoria não ta vazia e se o valor escrito nela ta dentro do ENUM BD_USUARIO_CATEGORIA_CONTA
      let categoriaContaValida =
        !req.body.categoria_conta ||
        BD_USUARIO_CATEGORIA_CONTA.includes(
          req.body.categoria_conta.toLocaleUpperCase()
        )
          ? true
          : false;

      if (!categoriaContaValida) {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);
      } else {
        //Checa se os dados ja enviados de usuario sao validos pra formar o modelo do banco, caso não for, ja da erro
        await Usuario.build(req.body).validate();

        req.body.senha = senhaHash(req.body.senha);

        //Fabrica de Usuario. Ele ira selecionar o usuario correto enviado pela requisição do cliente
        let categoriaUsuario: any = UsuarioController.categoriaUsuario(
          req.body.categoria_conta,
          req.body.nivel_acesso
          //BD_USUARIO_NIVEL_ACESSO[0] //Como essa função é publica, ela vai permitir criar apenas usuarios NORMAL
        );

        //permitir cadastrar apenas usuarios normais
        //req.body.nivel_acesso = BD_USUARIO_NIVEL_ACESSO[0];
        if (!categoriaUsuario)
          throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

        resultado = await categoriaUsuario.adicionar(req.body);
      }

      //VALOR ANTIGO funcionando
      //const novoUsuario: Usuario = req.body;
      // await new UsuarioRepo().adicionar(novoUsuario);
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);

      //Link para ver os erros possiveis
      //https://sequelize.org/api/v6/class/src/errors/database/exclusion-constraint-error.ts~exclusionconstrainterror
      /*if(err typeof SequelizeValidationError){
        message = "Erro Sequelize";
      }*/
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async obterPorId(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let dados = req.body.token;

      let categoriaUsuario: any = UsuarioController.categoriaUsuario(
        dados.categoria_conta,
        dados.nivel_acesso // O valor abaixo é o correto. Foi permitido ser cadastrado ADMIN para so para testes.
        //BD_USUARIO_NIVEL_ACESSO[0] //Como essa função é publica, ela vai permitir criar apenas usuarios NORMAL
      );

      resultado = await categoriaUsuario.obterPorId(dados.usuario_id);
      //const usuarioId = req.params["id"];
      //const usuario = await new UsuarioRepo().obterPorId(usuarioId);
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.header).json(resultado.toJSON());
    }
  }

  async obterPorEmail(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      const dadosUsuario = req.body;
      const usuario = await new UsuarioRepo().obterPorLogin(dadosUsuario.email);

      if (!usuario)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);
      else
        resultado.HttpConstruirRetorno(
          HttpStatusCode.SuccessOK,
          usuario,
          "Usuario obtido com sucesso."
        );
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.header).json(resultado.toJSON());
    }
  }

  async atualizar(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioDadosAutenticacao = req.body.token;
      delete req.body.token;

      const user = (
        await new UsuarioRepo().obterPorId(usuarioDadosAutenticacao.usuario_id)
      ).data;
      if (!user)
        throw new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);

      let categoriaUsuario: any = UsuarioController.categoriaUsuario(
        usuarioDadosAutenticacao.categoria_conta,
        usuarioDadosAutenticacao.nivel_acesso
        // BD_USUARIO_NIVEL_ACESSO[0] //Como essa função é publica, ela vai permitir criar apenas usuarios NORMAL
      );
      let usuario: any = req.body;
      for (let key in user) {
        //se tiver a chave vinda do usuario ela, se nao, usa a informacao do banco
        req.body.hasOwnProperty(key)
          ? (usuario[key] = req.body[key])
          : (usuario[key] = user[key]);
      }

      resultado = await categoriaUsuario.atualizar(usuario);

      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);

      //Link para ver os erros possiveis
      //https://sequelize.org/api/v6/class/src/errors/database/exclusion-constraint-error.ts~exclusionconstrainterror
      /*if(err typeof SequelizeValidationError){
          message = "Erro Sequelize";
        }*/
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async excluir(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let usuarioDadosAutenticacao = req.body.token;
      delete req.body.token;

      let categoriaUsuario: any = UsuarioController.categoriaUsuario(
        usuarioDadosAutenticacao.categoria_conta,
        BD_USUARIO_NIVEL_ACESSO[0] //Como essa função é publica, ela vai permitir criar apenas usuarios NORMAL
      );

      resultado = await categoriaUsuario.obterPorId(
        usuarioDadosAutenticacao.usuario_id
      );

      resultado = await categoriaUsuario.excluir(
        usuarioDadosAutenticacao.usuario_id
      );
      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }

  async recuperarSenha(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      if (!(req.body.token || req.body.senha))
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

      const usuarioDados: any = jwt.verify(
        req.body.token,
        process.env.JWT_SEGREDO as string
      );

      req.body.senha = senhaHash(req.body.senha);

      const usuario = await new UsuarioRepo().obterPorLogin(usuarioDados.email);

      if (!usuario)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      let dados: Usuario = new Usuario({
        usuario_id: usuarioDados.usuario_id,
        senha: req.body.senha,
      });

      resultado = await new UsuarioRepo().atualizar(dados);
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else if (error instanceof jwt.TokenExpiredError)
        resultado = new objetoDeComunicacao(
          HttpStatusCode.ClientErrorLoginTimeOut,
          {},
          `Token expirado. Necessario repetir a operação.`
        );
      else if (error instanceof jwt.JsonWebTokenError)
        resultado = new objetoDeComunicacao(
          HttpStatusCode.ClientErrorForbidden,
          {},
          "Token invalido."
        );
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    } finally {
      return res.status(resultado.message).json(resultado.toJSON());
    }
  }
}

export default new UsuarioController();
