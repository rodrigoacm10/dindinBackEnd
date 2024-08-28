import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
//var jwt = require("jsonwebtoken");
import { UsuarioRepo } from "../repository/usuario/UsuarioRepo";
import * as dotenv from "dotenv";
import HttpStatusCode from "../utils/HttpStatusCodes";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";
import { BD_USUARIO_NIVEL_ACESSO } from "../utils/Constantes";
import { senhaComparar } from "../utils/FuncoesUteis";

dotenv.config();

/*
https://dev.to/juliecherner/authentication-with-jwt-tokens-in-typescript-with-express-3gb1

https://dev.to/cristain/how-to-implement-jwt-authentication-using-node-express-typescript-app-2023-2c5o

https://www.topcoder.com/thrive/articles/authentication-and-authorization-in-express-js-api-using-jwt

https://stackoverflow.com/questions/77567378/how-to-handle-express-session-for-each-subsequent-user

https://www.makeuseof.com/express-apps-user-authentication-implementing/


https://blog.stackademic.com/jwt-authentication-protected-routes-and-express-middleware-6df9d6921b8e?gi=2d1d246fe81a

https://github.com/CodingAbdullah/Abdullah-Medium-Demos/blob/main/demos/Demo04_JSON_Express_Middleware/backend/Route/PostUserRoute.js

https://medium.com/@it.ermias.asmare/user-authentication-and-authorization-in-express-and-mongodb-using-jwt-643503a23452


*/

export const login = async (req: Request, res: Response) => {
  var resultado: objetoDeComunicacao = new objetoDeComunicacao(
    HttpStatusCode.ServerErrorInternal
  );
  try {
    const { email, senha } = req.body;
    if (!email || !senha)
      throw new objetoDeComunicacao(HttpStatusCode.ClientErrorBadRequest);

    const usuario = await new UsuarioRepo().obterPorLogin(email);

    if (!usuario)
      throw new objetoDeComunicacao(HttpStatusCode.ClientErrorNotFound);

    console.log(usuario);
    console.log(senhaComparar(senha, usuario.data.senha));
    if (
      !(email == usuario.data.email && senhaComparar(senha, usuario.data.senha))
    )
      /* throw {
        message: HttpStatusCode.ClientErrorForbidden,
        dados: {},
        mensagem_texto: "mandei a mensagem",
      };*/
      throw new objetoDeComunicacao(HttpStatusCode.ClientErrorForbidden);

    console.log(usuario);
    // req.body.password = JSON.stringify(SHA256(req.body.password).words);
    // if(JSON.stringify(SHA256(req.body.password).words) === data.dataValues.password)

    // https://stackoverflow.com/questions/66328425/jwt-argument-of-type-string-undefined-is-not-assignable-to-parameter-of-typ
    // Solucao foi usar o ! no final da variavel, assim o typescript nao testa o tipo OU colocar "as string"
    let token: string = gerarToken(
      usuario.data.usuario_id,
      usuario.data.email,
      usuario.data.categoria_conta,
      usuario.data.nivel_acesso
    );

    resultado.HttpConstruirRetorno(HttpStatusCode.SuccessOK, {
      token: token,
      nome: usuario.data.nome,
    });
  } catch (error: unknown) {
    console.log(error);
    if (error instanceof objetoDeComunicacao) {
      resultado = error;
    } else
      resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
  } finally {
    return res.status(resultado.header).json(resultado.HttpJSONRetorno());
  }
};

export function logado(req: Request, res: Response, next: NextFunction) {
  var resultado: objetoDeComunicacao = new objetoDeComunicacao(
    HttpStatusCode.ServerErrorInternal
  );
  try {
    const token = req.header("Token");

    if (!token)
      throw new objetoDeComunicacao(HttpStatusCode.ClientErrorUnauthorized);

    const decoded = jwt.verify(token, process.env.JWT_SEGREDO as string);
    req.body.token = decoded;
    next();
  } catch (error: unknown) {
    console.log(error);
    if (error instanceof objetoDeComunicacao) resultado = error;
    else if (error instanceof jwt.TokenExpiredError)
      resultado = new objetoDeComunicacao(
        HttpStatusCode.ClientErrorLoginTimeOut,
        {},
        `Token expirado. Necessario fazer login novamente.`
      );
    else if (error instanceof jwt.JsonWebTokenError)
      resultado = new objetoDeComunicacao(
        HttpStatusCode.ClientErrorForbidden,
        {},
        "Token invalido."
      );
    else
      resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    return res.status(resultado.header).json(resultado.HttpJSONRetorno());
  }
}

export function autorizado(req: Request, res: Response, next: NextFunction) {
  var resultado: objetoDeComunicacao = new objetoDeComunicacao(
    HttpStatusCode.ServerErrorInternal
  );
  try {
    const token = req.header("Token");

    if (!token)
      throw new objetoDeComunicacao(HttpStatusCode.ClientErrorUnauthorized);

    const decoded = jwt.verify(token, process.env.JWT_SEGREDO as string);
    req.body.token = decoded;

    if (
      req.body.token.nivel_acesso.toLocaleUpperCase() !=
      BD_USUARIO_NIVEL_ACESSO[1]
    )
      throw new objetoDeComunicacao(HttpStatusCode.ClientErrorUnauthorized);

    next();
  } catch (error: unknown) {
    console.log(error);
    if (error instanceof objetoDeComunicacao) resultado = error;
    else
      resultado = new objetoDeComunicacao(HttpStatusCode.ServerErrorInternal);
    return res.status(resultado.header).json(resultado.HttpJSONRetorno());
  }
}

export function gerarToken(
  usuario_id: string,
  email: string,
  categoria_conta?: string,
  nivel_acesso?: string,
  duracao_token: string = "3d"
): string {
  let token = jwt.sign(
    {
      usuario_id: usuario_id,
      email: email,
      categoria_conta: categoria_conta,
      nivel_acesso: nivel_acesso,
    },
    process.env.JWT_SEGREDO!,
    {
      expiresIn: duracao_token,
    }
  );
  return token;
}

// export const auth = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const token = req.header("Authorization")?.replace("Bearer ", "");

//     if (!token) {
//       throw new Error();
//     }

//     const decoded = jwt.verify(token, SECRET_KEY);
//     (req as CustomRequest).token = decoded;

//     next();
//   } catch (err) {
//     res.status(401).send("Please authenticate");
//   }
// };
