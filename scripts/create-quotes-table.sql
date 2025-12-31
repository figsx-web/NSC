-- Criar tabela para frases inspiracionais
CREATE TABLE IF NOT EXISTS inspirational_quotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quote TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  profession VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir 30 frases inspiracionais de professores e ganhadores do Nobel
INSERT INTO inspirational_quotes (quote, author, profession) VALUES 
('A educação é a arma mais poderosa que você pode usar para mudar o mundo.', 'Nelson Mandela', 'Líder e Educador'),
('A imaginação é mais importante que o conhecimento.', 'Albert Einstein', 'Físico - Nobel de Física 1921'),
('Ensinar é aprender duas vezes.', 'Joseph Joubert', 'Professor e Filósofo'),
('A educação não é preparação para a vida; educação é a própria vida.', 'John Dewey', 'Filósofo e Educador'),
('O que sabemos é uma gota; o que ignoramos é um oceano.', 'Isaac Newton', 'Físico e Matemático'),
('A ciência sem religião é manca, a religião sem ciência é cega.', 'Albert Einstein', 'Físico - Nobel de Física 1921'),
('A verdadeira educação consiste em pôr a descoberto ou fazer atualizar o melhor de uma pessoa.', 'Mahatma Gandhi', 'Líder e Educador'),
('Não há ensino sem pesquisa e pesquisa sem ensino.', 'Paulo Freire', 'Educador e Filósofo'),
('A educação é o passaporte para o futuro, pois o amanhã pertence àqueles que se preparam hoje.', 'Malcolm X', 'Ativista e Educador'),
('O importante não é o que fazem de nós, mas o que nós mesmos fazemos do que fizeram de nós.', 'Jean-Paul Sartre', 'Filósofo - Nobel de Literatura 1964'),
('A mente que se abre a uma nova ideia jamais voltará ao seu tamanho original.', 'Oliver Wendell Holmes', 'Professor e Escritor'),
('Educar é crescer. E crescer é viver. E viver é nascer a cada dia.', 'Paulo Freire', 'Educador e Filósofo'),
('A curiosidade é mais importante que o conhecimento.', 'Albert Einstein', 'Físico - Nobel de Física 1921'),
('Ensinar não é transferir conhecimento, mas criar as possibilidades para a sua produção.', 'Paulo Freire', 'Educador e Filósofo'),
('A educação é a chave para abrir a porta dourada da liberdade.', 'George Washington Carver', 'Educador e Cientista'),
('O conhecimento é poder.', 'Francis Bacon', 'Filósofo e Cientista'),
('A única fonte de conhecimento é a experiência.', 'Albert Einstein', 'Físico - Nobel de Física 1921'),
('Aprender é a única coisa de que a mente nunca se cansa, nunca tem medo e nunca se arrepende.', 'Leonardo da Vinci', 'Inventor e Educador'),
('A educação é o movimento da escuridão para a luz.', 'Allan Bloom', 'Professor e Filósofo'),
('Não se pode ensinar tudo a alguém, pode-se apenas ajudá-lo a encontrar por si mesmo.', 'Galileu Galilei', 'Físico e Astrônomo'),
('A ciência é uma forma de pensar muito mais do que um corpo de conhecimento.', 'Carl Sagan', 'Astrônomo e Educador'),
('O professor medíocre conta. O bom professor explica. O professor superior demonstra. O grande professor inspira.', 'William Arthur Ward', 'Educador e Escritor'),
('A educação é a mais poderosa arma que você pode usar para mudar o mundo.', 'Nelson Mandela', 'Líder e Educador'),
('Investir em conhecimento rende sempre os melhores juros.', 'Benjamin Franklin', 'Inventor e Educador'),
('A educação é o que sobra depois que você esquece tudo o que aprendeu na escola.', 'Albert Einstein', 'Físico - Nobel de Física 1921'),
('Ensinar é tocar uma vida para sempre.', 'Anônimo', 'Provérbio Educacional'),
('A verdadeira educação é aquela que liberta.', 'Paulo Freire', 'Educador e Filósofo'),
('O conhecimento é como uma candeia que ilumina o caminho.', 'Confúcio', 'Filósofo e Educador'),
('A educação não muda o mundo. A educação muda pessoas. Pessoas mudam o mundo.', 'Paulo Freire', 'Educador e Filósofo'),
('Diga-me e eu esqueço. Ensina-me e eu lembro. Envolve-me e eu aprendo.', 'Benjamin Franklin', 'Inventor e Educador')
ON CONFLICT DO NOTHING;

-- Verificar se as frases foram inseridas
SELECT COUNT(*) as total_quotes FROM inspirational_quotes;
