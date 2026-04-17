# Especificações do Projeto


## Personas

##

<img width="863" height="656" alt="image" src="https://github.com/user-attachments/assets/cdaad60f-505a-48d6-be5c-43065204a879" />

##

<img width="892" height="668" alt="image" src="https://github.com/user-attachments/assets/a6f7a8e0-9483-4b53-afa6-6fffe0729049" />

##

<img width="895" height="655" alt="image" src="https://github.com/user-attachments/assets/63e80a47-f61f-4a62-8b99-6a65ccca863c" />

##

<img width="900" height="650" alt="image" src="https://github.com/user-attachments/assets/b8b7f7c9-422c-427f-a9af-b1e3355fdd3e" />

##

<img width="892" height="657" alt="image" src="https://github.com/user-attachments/assets/8cdc04e0-03ff-43c1-be17-0d1ae8601772" />

## Histórias de Usuários

Com base na análise das personas forma identificadas as seguintes histórias de usuários:

|EU COMO... `PERSONA`| QUERO/PRECISO ... `FUNCIONALIDADE` |PARA ... `MOTIVO/VALOR`                 |
|--------------------|------------------------------------|----------------------------------------|
|Dona Maria, Idosa Independente| Receber lembretes simples e claros sobre meus medicamentos e consultas          | Não esquecer meus compromissos de saúde e manter minha autonomia               |
|João Henrique, Filho Acompanhante| Monitorar e editar os lembretes de medicação e consultas da minha mãe remotamente         | Garantir que ela esteja cuidando da saúde mesmo quando estou no trabalho               |
|Ana Beatriz, Acompanhante Profissional       | Organizar os alarmes e compromissos de cada paciente em perfis separados| Evitar confusões e oferecer um cuidado mais eficiente e personalizado |
|Lucas Andrade, Neto Acompanhante      | Configurar e acompanhar os lembretes de medicação e consultas do meu avô | Ajudá-lo a manter a saúde em dia mesmo à distância, com tranquilidade|
|Seu Antônio, Idoso aposentado    | Agendar lembretes conjuntos para mim e minha esposa, com instruções claras | Manter nossa rotina de saúde organizada e evitar esquecimentos|

## Modelagem do Processo de Negócio 

### Análise da Situação Atual

No contexto atual, muitos idosos dependem da própria memória ou anotações em papel para lembrar dos horários de seus medicamentos ou consultas médicas e exames. Além disso, muitos deles vivem sozinhos sem o acompanhamento de familiares ou cuidadores. Quando há alguma ajuda, ela costuma ser informal, com familiares ligando ocasionalmente ou enviando mensagens. Esse processo pode apresentar diversas falhas, como:

> -	Esquecer de tomar os medicamentos no horário correto;
> -	Perda de consultas por confusão ou falha na memória;
> -	Falta de acompanhamento estruturado por parte de família.
Nesse contexto, ocorrem muitos erros que afetam diretamente a saúde do idoso, podendo levar ao agravamento de doenças e diminuição da qualidade de vida.


### Processo 1 – Agendamento e Lembrete de Medicamentos e Consultas pelo Usuário

![Processo 1](https://github.com/ICEI-PUC-Minas-PMV-ADS/pmv-ads-2025-2-e3-proj-mov-t1-pmv-ads-2025-2-e3-proj-mov-t1-g1/blob/main/docs/img/bpmn-proc-atual.jpg)

### Descrição Geral da Proposta

A proposta consiste na criação de uma aplicação móvel acessível a idosos integrando Acompanhantes (familiares/cuidadores). A aplicação permitirá o agendamento e Lembrete de Medicamentos e Consultas pelo Usuário, assim, o idoso e a pessoa que o assiste poderá receber recordatórios das informações por eles registradas, como por exemplo, notificações para recordar de tomar medicamentos ou para recordar consultas próximas e confirmação por parte do idoso se tomou os medicamentos. Dito isso, os acompanhantes poderão monitorar ao idoso e notifica-lo caso não esteja seguindo as recomendações médicas.

Além disso, a aplicação permitirá:

> -	a Interface simples e intuitiva, com uso de ícones grandes;
> -	Criação de perfis de Acompanhantes (familiares/cuidadores), com acesso à rotina do idoso.

Limites da proposta:

> -	Depende da conexão com a internet ou rede móvel;
> -	Requer que o idoso esteja familiarizado com o uso de dispositivos simples (como um celular ou tablet com tela grande);
> -	Não substitui o acompanhamento médico.
A aplicação tem como objetivo reduzir riscos à saúde dos idosos, promover maior segurança e tranquilidade para famílias e gerar valor social ao promover inclusão digital.

### Processo 2 – Agendamento e Lembrete de Medicamentos e Consultas pelo Usuário

![Processo 2](https://github.com/ICEI-PUC-Minas-PMV-ADS/pmv-ads-2025-2-e3-proj-mov-t1-pmv-ads-2025-2-e3-proj-mov-t1-g1/blob/main/docs/img/DiagramaProcesso1%20Diagrama.png)

## Indicadores de Desempenho

| **Indicador**                        | **Objetivo**                                                            | **Descrição**                                                                          | **Cálculo**                                                        | **Fonte de dados**            | **Perspectiva**             |
| ------------------------------------ | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------- | --------------------------- |
| **Taxa de cumprimento de lembretes** | Avaliar se os idosos estão seguindo os alarmes de medicação e consultas | Percentual de lembretes confirmados em relação ao total configurado                    | (Nº de lembretes confirmados ÷ Nº de lembretes disparados) \* 100  | Tabela de lembretes           | Saúde / Qualidade de Vida   |
| **Taxa de engajamento dos usuários** | Medir a frequência de uso do aplicativo                                 | Quantidade média de acessos ao aplicativo por usuário ativo                            | (Total de acessos ÷ Nº de usuários ativos)                         | Logs de acesso                | Processos Internos          |
| **Taxa de acompanhamento familiar**  | Verificar a participação de familiares/Acompanhantes                       | Percentual de idosos que possuem pelo menos um familiar ou Acompanhante conectado ao app   | (Nº de idosos com familiar conectado ÷ Nº total de idosos) \* 100  | Tabela de usuários e vínculos | Clientes / Suporte Familiar |
| **Índice de acessibilidade**         | Avaliar se o público idoso consegue usar o app sem dificuldades         | Percentual de tarefas concluídas sem erros (ex.: cadastrar alarme, editar compromisso) | (Tarefas concluídas sem erro ÷ Total de tarefas realizadas) \* 100 | Logs de interação             | Aprendizado e Crescimento   |
| **Satisfação do usuário (NPS)**      | Medir a satisfação dos idosos e familiares com o aplicativo             | Resultado de pesquisa de satisfação (escala 0 a 10)                                    | (Nº de promotores – Nº de detratores) ÷ Nº de respondentes \* 100  | Pesquisa interna              | Clientes                    |


## Requisitos

Usamos a metodologia MoSCoW para priorizar o escopo da V1 do app. Mapeamos ALTA → Must-have, MÉDIA → Should-have, BAIXA → Could-have e tudo que está explicitamente “fora da V1” nas Restrições como Won’t-have (por agora). Assim, a V1 foca em 16 Must-haves (9 RF + 7 RNF) — como onboarding acessível, CRUD de medicamentos, alarmes robustos, consultas, tela inicial simples, contatos de emergência, desempenho/entregabilidade dos alarmes, acessibilidade básica, LGPD e modo offline — enquanto 10 Should-haves entram como extensão se houver folga, e 4 Could-haves ficam para oportunidades/versões seguintes. As Restrições delimitam claramente o que não entrará na V1 (iOS, integrações externas, nuvem, voz, recorrências avançadas etc.).
### Requisitos Funcionais


| ID | Descrição | Prioridade |
|---|---|---|
| **RF-001** | **Onboarding acessível**: ajuste de fonte, contraste e som dos alertas (preferências salvas e editáveis). | ALTA |
| **RF-002** | **Cadastro do idoso** (nome, contato, notas básicas) – **sem dados clínicos sensíveis**. | ALTA |
| **RF-003** | **CRUD de medicamentos** (nome, dose, horários, início/fim, instruções). | ALTA |
| **RF-004** | **Alarmes de medicação** com **horários fixos** e **a cada X horas**. | ALTA |
| **RF-005** | **Ações do alarme**: Confirmar, **Soneca** (5/10/15 min) e **Pular** (motivo opcional). | ALTA |
| **RF-006A** | **Histórico de consultas e medicamentos (local)** registrando data/hora e a ação do usuário. | MÉDIA |
| **RF-006B** | **Exportação** do histórico (CSV; **PDF opcional**). Disponível para o Usuário Principal e para o Acompanhante Editor. | BAIXA |
| **RF-007** | **CRUD de consultas/exames** (data, hora, local, observações). | ALTA |
| **RF-008** | **Lembrete de consulta** (1h antes e no horário) e opção de abrir o app de mapas. | ALTA |
| **RF-009** | **Vínculo com Acompanhantes** via convite (link/código), com permissão configurável por Acompanhante: Visualizador (padrão) ou Editor. Deve ser possível alterar a permissão a qualquer momento. | MÉDIA |
| **RF-009A** | **Revogar acesso de Acompanhante**: o Usuário Principal pode remover a qualquer momento; o acesso deve ser cortado imediatamente. | MÉDIA |
| **RF-010** | **Notificação ao(s) Acompanhante(s)** quando uma dose não for confirmada dentro do tempo esperado (após X minutos). | MÉDIA |
| **RF-011** | **Tela inicial simplificada**: *Tomar agora*, *Próxima consulta*, *Contato do(s) acompanhante(s)*. | ALTA |
| **RF-012** | **Notificação persistente** exibindo a próxima ação. | BAIXA |
| **RF-013** | **Perfis múltiplos** (Acompanhante gerencia até 3 assistidos). | BAIXA |
| **RF-014** | **Contatos de emergência**: discagem/WhatsApp rápido. | ALTA |
| **RF-015** | **Configurações de acessibilidade in-app** (toggles: texto grande, alto contraste, vibração longa, feedback háptico). | MÉDIA |
| **RF-016** | **Backup/restauração local** e compartilhamento seguro da agenda (CSV/PDF). | MÉDIA |
| **RF-017** | **Central de ajuda** com dicas curtas. | BAIXA |


### Requisitos não Funcionais

| ID | Descrição | Prioridade |
|---|---|---|
| **RNF-001 – Acessibilidade** | Área de toque mínima **48×48dp**; contraste mínimo **4,5:1**; suporte a **alto contraste** e **texto ampliado**. | ALTA |
| **RNF-002 – Desempenho** | Alarmes devem disparar **no horário** (tolerância ≤ **5s**) mesmo com o app fechado. | ALTA |
| **RNF-003 – Usabilidade** | Criar um alarme em **≤ 2 telas** e **≤ 4 toques**. | ALTA |
| **RNF-004 – Confiabilidade** | Taxa de disparo de alarmes ≥ **99,5%** em 30 dias de uso. | ALTA |
| **RNF-005 – Segurança & LGPD** | **Consentimento claro** para compartilhamento com Acompanhantes; **tela de privacidade** em linguagem simples; **PIN/biometria** (opcional); Revogação imediata de acesso quando o Usuário Principal remover um Acompanhante. | ALTA |
| **RNF-006 – Compatibilidade** | Suporte a **Android 8.0+ (API 26)** e telas de 4,7″ a 10″. | MÉDIA |
| **RNF-007 – Notificações** | Canais dedicados (ex.: “Medicação”) com **som + vibração prolongada** configuráveis. | ALTA |
| **RNF-008 – Eficiência energética** | Uso de **WorkManager/AlarmManager** (Tudo que rodar em background deve usar as APIs do Android próprias). | MÉDIA |
| **RNF-009 – Offline-first** | **Alarmes e agenda funcionam sem internet**; sincronização assíncrona quando houver conexão. | ALTA |
| **RNF-010  – Qualidade** | Testes instrumentados nos módulos de alarme e checagem manual de acessibilidade nas telas principais. | MÉDIA |
| **RNF-011 – Histórico (logs)** | manter os logs no aparelho; se estiver offline, guardar e sincronizar quando voltar a conexão; reter por 12 meses. Cada log deve indicar quem fez, o que fez e quando. | MÉDIA |


## Restrições

| ID   | Restrição                                                                                                      |
|------|----------------------------------------------------------------------------------------------------------------|
| R-01 | **Prazo**: entregar a V1 até o final do semestre (cronograma acadêmico).                                       |
| R-02 | **Plataforma**: Android 8.0+. **iOS fora de escopo na V1.**                           |
| R-03 | **Privacidade/LGPD**: não armazenar dados clínicos sensíveis (diagnósticos, laudos). Apenas notas básicas.     |
| R-04 | **Integrações externas**: nenhuma (SUS, operadoras, prontuários) na V1.                                        |
| R-05 | **Backup**: apenas local na V1 (sem nuvem).                                                                    |
| R-06 | **Relatórios**: exportação em **CSV** na V1 (PDF opcional/V2).                                                 |
| R-07 | **Licenças**: somente bibliotecas open-source permissivas (**MIT/Apache-2.0**); sem dependências pagas.        |
| R-08 | **Recorrências**: V1 suporta **horários fixos** e **a cada X horas** (sem “antes/depois das refeições”).       |
| R-09 | **Voz**: **comandos de voz fora** da V1;                                                                       |
| R-10 | **Limite de até 3** Acompanhantes por conta     
| R-11 | **Voz**: **comandos de voz fora** da V1;     
## Diagrama de Casos de Uso

<img alt="Diagrama de Casos de Uso" src="https://github.com/ICEI-PUC-Minas-PMV-ADS/pmv-ads-2025-2-e3-proj-mov-t1-pmv-ads-2025-2-e3-proj-mov-t1-g1/blob/main/docs/img/Diagrama%20de%20Casos%20de%20Uso.png?raw=true"/>

# Matriz de Rastreabilidade

| **RF \ RNF**                            | RNF-001 Acessibilidade | RNF-002 Desempenho | RNF-003 Usabilidade | RNF-004 Confiabilidade | RNF-005 Segurança & LGPD | RNF-006 Compatibilidade | RNF-007 Notificações | RNF-008 Eficiência Energética | RNF-009 Offline-first | RNF-010 Qualidade | RNF-011 Histórico |
| --------------------------------------- | ---------------------- | ------------------ | ------------------- | ---------------------- | ------------------------ | ----------------------- | -------------------- | ----------------------------- | --------------------- | ----------------- | ----------------- |
| **RF-001** Onboarding acessível         | X                      |                    | X                   |                        |                          | X                       |                      |                               |                       | X                 |                   |
| **RF-002** Cadastro do idoso            |                        |                    |                     |                        | X                        | X                       |                      |                               |                       | X                 |                   |
| **RF-003** CRUD de medicamentos         |                        |                    | X                   |                        | X                        | X                       |                      |                               | X                     | X                 |                   |
| **RF-004** Alarmes de medicação         |                        | X                  | X                   | X                      |                          | X                       | X                    | X                             | X                     | X                 |                   |
| **RF-005** Ações do alarme              |                        | X                  | X                   | X                      |                          |                         | X                    | X                             | X                     | X                 |                   |
| **RF-006A** Histórico local             |                        |                    |                     |                        |                          | X                       |                      |                               | X                     | X                 | X                 |
| **RF-006B** Exportação histórico        |                        |                    |                     |                        | X                        |                         |                      |                               |                       | X                 | X                 |
| **RF-007** CRUD consultas/exames        |                        |                    | X                   |                        | X                        | X                       |                      |                               | X                     | X                 |                   |
| **RF-008** Lembrete consulta            |                        | X                  | X                   | X                      |                          | X                       | X                    | X                             | X                     | X                 |                   |
| **RF-009** Vínculo com Acompanhantes    |                        |                    |                     |                        | X                        | X                       |                      |                               |                       | X                 |                   |
| **RF-009A** Revogar acesso              |                        |                    |                     |                        | X                        |                         |                      |                               |                       | X                 |                   |
| **RF-010** Notificação de dose perdida  |                        | X                  | X                   | X                      | X                        |                         | X                    | X                             | X                     | X                 |                   |
| **RF-011** Tela inicial simplificada    | X                      |                    | X                   |                        |                          | X                       |                      |                               |                       | X                 |                   |
| **RF-012** Notificação persistente      |                        | X                  |                     | X                      |                          |                         | X                    | X                             | X                     | X                 |                   |
| **RF-013** Perfis múltiplos             |                        |                    |                     |                        | X                        | X                       |                      |                               | X                     | X                 |                   |
| **RF-014** Contatos emergência          |                        |                    | X                   |                        | X                        | X                       |                      |                               |                       | X                 |                   |
| **RF-015** Configurações acessibilidade | X                      |                    | X                   |                        |                          | X                       |                      |                               |                       | X                 |                   |
| **RF-016** Backup/restauração           |                        |                    |                     |                        | X                        | X                       |                      |                               | X                     | X                 | X                 |
| **RF-017** Central de ajuda             | X                      |                    | X                   |                        |                          | X                       |                      |                               |                       | X                 |                   |

# Gerenciamento de Projeto

De acordo com o PMBoK v6 as dez áreas que constituem os pilares para gerenciar projetos, e que caracterizam a multidisciplinaridade envolvida, são: Integração, Escopo, Cronograma (Tempo), Custos, Qualidade, Recursos, Comunicações, Riscos, Aquisições, Partes Interessadas. Para desenvolver projetos um profissional deve se preocupar em gerenciar todas essas dez áreas. Elas se complementam e se relacionam, de tal forma que não se deve apenas examinar uma área de forma estanque. É preciso considerar, por exemplo, que as áreas de Escopo, Cronograma e Custos estão muito relacionadas. Assim, se eu amplio o escopo de um projeto eu posso afetar seu cronograma e seus custos.

## Gerenciamento de Tempo

Com diagramas bem organizados que permitem gerenciar o tempo nos projetos, o gerente de projetos agenda e coordena tarefas dentro de um projeto para estimar o tempo necessário de conclusão.

<br>

<b>Cronograma Simplificado do Projeto | Visão Geral</b>
<br>
<img width="1663" height="256" alt="image" src="https://github.com/user-attachments/assets/e7b3ee05-0e3e-4530-a5f4-8a6476688e4a" />

<br>
<b>Cronograma Simplificado do Projeto | Visão Etapa 01</b>
<img width="1331" height="624" alt="image" src="https://github.com/user-attachments/assets/4290af09-7e5b-47ac-af71-67b63e484c7e" />
<br><br><br>


<b>Gráfico de Gantt</b>
<br>
O gráfico de Gantt ou diagrama de Gantt também é uma ferramenta visual utilizada para controlar e gerenciar o cronograma de atividades de um projeto. Com ele, é possível listar tudo que precisa ser feito para colocar o projeto em prática, dividir em atividades e estimar o tempo necessário para executá-las.
<br>
<img width="1919" height="773" alt="Captura de tela 2025-08-31 194356" src="https://github.com/user-attachments/assets/2203a1b5-65ce-4f6d-a6c8-f09b345a80fd" />
<br><br><br>

## Gerenciamento de Equipe

O gerenciamento adequado de tarefas contribuirá para que o projeto alcance altos níveis de produtividade. Por isso, é fundamental que ocorra a gestão de tarefas e de pessoas, de modo que os times envolvidos no projeto possam ser facilmente gerenciados. 

<b>Linha do Tempo do Projeto</b>
<img width="1839" height="638" alt="image" src="https://github.com/user-attachments/assets/6b242e44-4fd7-4350-90b1-f8192913a77a" />

<br>

<b>Linha do Tempo do Projeto | Versão Simplificada</b>
<img width="1781" height="788" alt="image" src="https://github.com/user-attachments/assets/659acfce-3964-4fd3-83fb-dff98d57d938" />

## Gestão de Orçamento

O processo de determinar o orçamento do projeto é uma tarefa que depende, além dos produtos (saídas) dos processos anteriores do gerenciamento de custos, também de produtos oferecidos por outros processos de gerenciamento, como o escopo e o tempo.

<b>Orçamento Geral</b>
<img width="954" height="237" alt="image" src="https://github.com/user-attachments/assets/1ce78a14-9634-4aab-b8e9-22d4ccd73b4a" />
<br><br>


Dado que a equipe é formada por 7 integrantes, segue o informativo detalhado do orçamento dedicado à categoria de Recursos Humanos.

<b>Visão Detalhada: Recursos Humanos</b>
<img width="1232" height="293" alt="image" src="https://github.com/user-attachments/assets/c710b52d-fdfc-4844-bded-fb47fa964748" />
