-- Inserir Projeto "A3 Project Manager" gerenciado por Diego Martins Moreira (ID 2)
INSERT INTO projetos (nome, descricao, data_inicio, data_termino_prevista, status, gerente_id)
VALUES ('A3 Project Manager', 'Descrição das tarefas para construir este projeto', '2026-06-01', '2026-06-30', 'EM_ANDAMENTO', 2);

-- Inserir Equipe "Desenvolvimento A3"
INSERT INTO equipes (nome, descricao)
VALUES ('Desenvolvimento A3', 'Equipe responsável pelo desenvolvimento do A3 Project Manager');

-- Vincular colaboradores à equipe: Heber (ID 3), João (ID 4), Lisiane (ID 5) na equipe (ID 1)
INSERT INTO equipe_membros (equipe_id, usuario_id) VALUES
(1, 3),
(1, 4),
(1, 5);

-- Alocar a equipe (ID 1) no projeto (ID 1)
INSERT INTO projeto_equipes (projeto_id, equipe_id) VALUES
(1, 1);

-- Inserir Tarefas associadas ao projeto (ID 1) e atribuídas aos membros alocados
INSERT INTO tarefas (titulo, descricao, prazo, status, responsavel_id, projeto_id) VALUES
('Modelagem de Dados e DER', 'Criação do DER e modelagem lógica das entidades Usuário, Equipe, Projeto e Tarefa.', '2026-06-10', 'CONCLUIDO', 3, 1),
('Módulo de Usuários e Autenticação', 'Implementação do cadastro de usuários com regras de CPF único e autenticação Spring Security.', '2026-06-12', 'CONCLUIDO', 4, 1),
('Módulo de Projetos e Gerenciamento', 'Implementação do CRUD de Projetos com vinculação obrigatória de Gerente e datas de término.', '2026-06-20', 'EM_ANDAMENTO', 5, 1),
('Módulo de Equipes e Alocação', 'Criação das funcionalidades de adicionar/remover membros em equipes e alocar equipes nos projetos.', '2026-06-22', 'EM_ANDAMENTO', 3, 1),
('Quadro de Acompanhamento Kanban', 'Implementação da interface do quadro de tarefas e lógica de movimentação de status.', '2026-06-25', 'A_INICIAR', 4, 1),
('Relatórios e Documentação', 'Geração de relatórios de desempenho dos projetos e índice de ocupação dos colaboradores.', '2026-06-28', 'A_INICIAR', 5, 1);
