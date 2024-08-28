import { ValidationError } from "sequelize";
import { gerarToken } from "../../middleware/Autenticacao";
import { UsuarioCPF } from "../../models/UsuarioCPF";
import { UsuarioCPFRepo } from "../../repository/usuario/UsuarioCPFRepo";
import { UsuarioRepo } from "../../repository/usuario/UsuarioRepo";
import HttpStatusCode from "../../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../../utils/ObjetoDeComunicacao";

class UsuarioCPFController {
  async adicionar(body: any): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      //const novoUsuario: UsuarioMEI = dados;
      // await new UsuarioRepo().adicionar(novoUsuario);
      console.log("teste");
      //Verificando se existe o campo "cpf" e se ele não esta vazio
      if (Object.keys(body).includes("cpf") && body.cpf) {
        await UsuarioCPF.build({
          usuario_id: 5,
          cpf: body.cpf,
        }).validate();

        let usuarioDados: objetoDeComunicacao =
          await new UsuarioRepo().adicionar(body);
        body.usuario_id = usuarioDados.data.usuario_id;
        await new UsuarioCPFRepo().adicionar(body);

        let token: string = gerarToken(
          usuarioDados.data.usuario_id,
          usuarioDados.data.email,
          usuarioDados.data.categoria_conta,
          usuarioDados.data.nivel_acesso
        );
        resultado.HttpConstruirRetorno(
          HttpStatusCode.SuccessOK,
          {
            // usuario_id: usuarioDados.data.usuario_id,
            token: token,
            // nome: usuarioDados.data.nome,
          },
          "Usuario CPF cadastrado com sucesso."
        );
      } else {
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);
      }
      //await UsuarioMEI.build().validate();
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

  async obterPorId(usuarioId: string): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      resultado = await new UsuarioRepo().obterPorId(usuarioId);
      let variavelRetorno: objetoDeComunicacao = resultado;
      resultado = await new UsuarioCPFRepo().obterPorId(usuarioId);

      for (let key in resultado.data)
        variavelRetorno.data[key] = resultado.data[key];
      delete variavelRetorno.data.senha;

      return variavelRetorno;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);

      throw resultado;
    }
  }

  async atualizar(usuario: any): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      let user: objetoDeComunicacao = await new UsuarioCPFRepo().obterPorId(
        usuario.usuario_id
      );
      if (!user)
        throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

      if (usuario.cpf) await UsuarioCPF.build({ cpf: usuario.cpf }).validate();

      resultado = await new UsuarioRepo().atualizar(usuario);
      resultado = await new UsuarioCPFRepo().atualizar(usuario);

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

  async excluir(usuarioId: string): Promise<objetoDeComunicacao> {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      resultado = await new UsuarioRepo().excluir(usuarioId);

      return resultado;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof objetoDeComunicacao) resultado = error;
      else
        resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);

      throw resultado;
    }
  }
}

export default new UsuarioCPFController();
