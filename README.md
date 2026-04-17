# Cuida Bem

`Análise e Desenvolvimento de Sistemas`

`Eixo 3 - Projeto: Desenvolvimento de uma Aplicação Móvel em um Ambiente de Negócio - Turma 01 - 2025/2`

`3º SEMESTRE`

O projeto consiste no desenvolvimento de um aplicativo móvel de agenda e alarmes voltado a pessoas idosas, desenhado com foco absoluto em acessibilidade e simplicidade.

## Integrantes

* Állan da Silva Barbosa
* Ana Clara Cândida Mattos
* Júlio César Siqueira Gomes
* Letícia Rangel Vilarim
* Nathan Felipe Zanetti Ferreira
* Rayssa Eduarda Guilherme Viana
* Rondinelli Silva de Oliveira

## Orientador

* Will Ricardo dos Santos Machado

## Instruções de utilização

Assim que a primeira versão do sistema estiver disponível, deverá complementar com as instruções de utilização. Descreva como instalar eventuais dependências e como executar a aplicação.

# Documentação

<ol>
<li><a href="docs/01-Documentação de Contexto.md"> Documentação de Contexto</a></li>
<li><a href="docs/02-Especificação do Projeto.md"> Especificação do Projeto</a></li>
<li><a href="docs/03-Metodologia.md"> Metodologia</a></li>
<li><a href="docs/04-Projeto de Interface.md"> Projeto de Interface</a></li>
<li><a href="docs/05-Arquitetura da Solução.md"> Arquitetura da Solução</a></li>
<li><a href="docs/06-Template Padrão da Aplicação.md"> Template Padrão da Aplicação</a></li>
<li><a href="docs/07-Programação de Funcionalidades.md"> Programação de Funcionalidades</a></li>
<li><a href="docs/08-Plano de Testes de Software.md"> Plano de Testes de Software</a></li>
<li><a href="docs/09-Registro de Testes de Software.md"> Registro de Testes de Software</a></li>
<li><a href="docs/10-Plano de Testes de Usabilidade.md"> Plano de Testes de Usabilidade</a></li>
<li><a href="docs/11-Registro de Testes de Usabilidade.md"> Registro de Testes de Usabilidade</a></li>
<li><a href="docs/12-Apresentação do Projeto.md"> Apresentação do Projeto</a></li>
<li><a href="docs/13-Referências.md"> Referências</a></li>
</ol>

# Código

<li><a href="src/README.md"> Código Fonte</a></li>

# Apresentação

<li><a href="presentation/README.md"> Apresentação da solução</a></li>

---

## ✅ Como rodar o app no seu computador

### 1. O que você precisa instalar

Antes de começar, instale estes itens no seu computador:

#### 🔹 Node.js (versão 18 ou 20)
- Download: https://nodejs.org/en/download
- Instale normalmente (próximo, próximo, concluir)
- Reinicie o computador após instalar (opcional)

#### 🔹 Git (para gerenciar códigos)
- Download: https://git-scm.com/downloads
- Instale clicando em “Next” até terminar

#### 🔹 Expo Go (no celular)
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent  
- iPhone: procure por **Expo Go** na App Store

---

### 2. Baixando o projeto

1. Se recebeu um **arquivo ZIP**, extraia numa pasta simples, como:

C:\meu-app


2. Clique com o botão direito dentro da pasta do projeto  (\app)
Selecione **"Abrir no PowerShell"** ou **Terminal**.

---

### 3. Instalando as dependências

Com o terminal aberto dentro da pasta do projeto, execute:


npm install

Esse comando baixa tudo que o projeto precisa.
Aguarde até terminar.

4. Iniciando o projeto
Agora, para iniciar, digite:


npm start

O Expo irá abrir no navegador e exibir um QR Code.

-> Para ver o app no seu celular:

Abra o Expo Go (Compativel com a versão do projeto -> SDK49)

Aponte a câmera para o QR Code

O app será carregado automaticamente

Obs.: O celular e o PC precisam estar na mesma rede Wi-Fi.

* Caso dê algum erro
Tente um desses comandos no terminal:

Limpar cache:
npm start -- --clear

Atualizar pacotes:
npx expo install

Diagnóstico automático:
npx expo-doctor

---

### Informações técnicas:

Node.js: 18.x ou 20.x

Expo: SDK 49

React Native: 0.72.10

Gerenciamento de estado: Context API

Notificações: expo-notifications

Armazenamento local: AsyncStorage

