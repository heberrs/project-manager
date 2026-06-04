CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    cargo VARCHAR(255) NOT NULL,
    login VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil VARCHAR(50) NOT NULL
);

CREATE TABLE projetos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_inicio DATE NOT NULL,
    data_termino_prevista DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    gerente_id BIGINT NOT NULL,
    CONSTRAINT fk_projetos_gerente FOREIGN KEY (gerente_id) REFERENCES usuarios (id)
);

CREATE TABLE equipes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT
);

CREATE TABLE equipe_membros (
    equipe_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    PRIMARY KEY (equipe_id, usuario_id),
    CONSTRAINT fk_equipe_membros_equipe FOREIGN KEY (equipe_id) REFERENCES equipes (id) ON DELETE CASCADE,
    CONSTRAINT fk_equipe_membros_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE TABLE projeto_equipes (
    projeto_id BIGINT NOT NULL,
    equipe_id BIGINT NOT NULL,
    PRIMARY KEY (projeto_id, equipe_id),
    CONSTRAINT fk_projeto_equipes_projeto FOREIGN KEY (projeto_id) REFERENCES projetos (id) ON DELETE CASCADE,
    CONSTRAINT fk_projeto_equipes_equipe FOREIGN KEY (equipe_id) REFERENCES equipes (id) ON DELETE CASCADE
);

CREATE TABLE tarefas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    prazo DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    responsavel_id BIGINT,
    projeto_id BIGINT NOT NULL,
    CONSTRAINT fk_tarefas_responsavel FOREIGN KEY (responsavel_id) REFERENCES usuarios (id) ON DELETE SET NULL,
    CONSTRAINT fk_tarefas_projeto FOREIGN KEY (projeto_id) REFERENCES projetos (id) ON DELETE CASCADE
);
