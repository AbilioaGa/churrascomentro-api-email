import cors from "@fastify/cors";
import fastify from "fastify";
import formData from "form-data";
import Mailgun from "mailgun.js";

const server = fastify();

// Configuração de origens permitidas
const allowedOrigins = ["https://churrascomentro.vercel.app"];

// Registre o plugin CORS com configuração de origens permitidas
server.register(cors, {
  origin: function (origin, cb) {
    if (!origin) return cb(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = "A origem não é permitida";
      return cb(new Error(msg), false);
    }
    return cb(null, true);
  },
});


server.get("/", (request, reply) => {
  reply.send({ success: true, message: "Churrascômetro!" });
})

// Endpoint para enviar e-mails
server.post("/api/send-email", async (request, reply) => {
  const { email, password } = request.body; // Supondo que o frontend envie os dados do e-mail e senha

  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({ username: "api", key: process.env.MAILGUN_API_KEY });

  // Definindo o cabeçalho 'Access-Control-Allow-Origin' na resposta
  reply.header('Access-Control-Allow-Origin', request.headers.origin);

  try {
    const msg = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: "AdaFood <abilioaga@hotmail.com>",
      to: [email],
      subject: "CHURRASCÔMETRO",
      html: `<h1>Esqueceu sua senha?</h1><p>É comum que isso aconteça com todos nós, e não queremos que o seu churrasco seja esquecido por causa disso.</p><p>Sua senha é: <strong>${password}</strong></p>`,
    });

    console.log(msg); // Log da resposta da API de envio de e-mail
    reply.send({ success: true, message: "E-mail enviado com sucesso!" });
  } catch (error) {
    console.error(error); // Log de erros
    reply.status(500).send({ success: false, message: "Erro ao enviar e-mail." });
  }
});

const start = async () => {
  try {
    await server.listen({ port: process.env.PORT || 3333, host: "0.0.0.0" });
    const address = server.server.address();
    const port = typeof address === "string" ? address : address?.port;
    console.log(`Servidor rodando na porta: ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
