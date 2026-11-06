import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Code2, Plus } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';
import { gameService } from '@/services/gameService';
import { notify } from '@/stores/notificationStore';
import type { AdminQuestion } from '@/types/api';
import { errorMessage } from '@/utils/errors';
import { formatDateTime } from '@/utils/format';

export default function AdminQuestionsPage() {
  useDocumentTitle('Администрирование: вопросы');
  const queryClient = useQueryClient();
  const [gameFilter, setGameFilter] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminQuestion | null>(null);
  const [gameCode, setGameCode] = useState('guess_player');
  const [questionData, setQuestionData] = useState(
    '{\n  "question": "Кто забил больше всех голов в истории Лиги чемпионов?",\n  "options": []\n}',
  );
  const [correctAnswer, setCorrectAnswer] = useState('""');
  const [difficulty, setDifficulty] = useState('medium');
  const [isActive, setIsActive] = useState(true);
  const [jsonError, setJsonError] = useState('');

  const gamesQuery = useQuery({
    queryKey: ['games'],
    queryFn: gameService.list,
    staleTime: 60_000,
  });
  const questionsQuery = useQuery({
    queryKey: ['admin', 'questions', page, gameFilter],
    queryFn: () => adminService.questions(gameFilter || undefined, page, 20),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const parsedQuestion = JSON.parse(questionData) as Record<string, unknown>;
      const parsedAnswer = JSON.parse(correctAnswer) as unknown;
      const body: Record<string, unknown> = {
        question_data: parsedQuestion,
        correct_answer: parsedAnswer,
        difficulty: difficulty || null,
        is_active: isActive,
      };
      if (!editing) {
        body.game_code = gameCode;
      }
      return editing
        ? adminService.updateQuestion(editing.id, body)
        : adminService.createQuestion(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
      notify.success(editing ? 'Вопрос обновлён' : 'Вопрос создан');
      setOpen(false);
      setEditing(null);
      setJsonError('');
    },
    onError: (error) => notify.error('Не удалось сохранить вопрос', errorMessage(error)),
  });

  const openCreate = () => {
    setEditing(null);
    setGameCode('guess_player');
    setQuestionData(
      '{\n  "question": "Кто забил больше всех голов в истории Лиги чемпионов?",\n  "options": []\n}',
    );
    setCorrectAnswer('""');
    setDifficulty('medium');
    setIsActive(true);
    setJsonError('');
    setOpen(true);
  };

  const openEdit = (question: AdminQuestion) => {
    setEditing(question);
    setGameCode(question.game_code);
    setQuestionData(JSON.stringify(question.question_data, null, 2));
    setCorrectAnswer(JSON.stringify(question.correct_answer, null, 2));
    setDifficulty(question.difficulty ?? 'medium');
    setIsActive(question.is_active);
    setJsonError('');
    setOpen(true);
  };

  const submit = () => {
    try {
      JSON.parse(questionData);
      JSON.parse(correctAnswer);
    } catch {
      setJsonError('Некорректный JSON в одном из полей');
      return;
    }
    setJsonError('');
    saveMutation.mutate();
  };

  const questions = questionsQuery.data?.data ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Игровые вопросы"
        subtitle="Контент и сложность заданий для игровых режимов."
        actions={
          <Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
            Добавить вопрос
          </Button>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-bg-card p-4 sm:flex-row sm:items-center">
        <Select
          className="sm:w-64"
          options={[
            { value: '', label: 'Все игры' },
            ...(gamesQuery.data ?? []).map((game) => ({
              value: game.code,
              label: game.name,
            })),
          ]}
          value={gameFilter}
          onChange={(event) => {
            setGameFilter(event.target.value);
            setPage(1);
          }}
          aria-label="Фильтр игры"
        />
        <Badge variant="info">
          {questionsQuery.data?.meta?.total ?? 0} вопросов
        </Badge>
      </div>

      {questionsQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-20" />
          ))}
        </div>
      ) : questionsQuery.isError ? (
        <ErrorState
          error={questionsQuery.error}
          onRetry={() => questionsQuery.refetch()}
        />
      ) : (
        <div className="space-y-1.5">
          {questions.map((question) => (
            <div
              key={question.id}
              className="rounded-xl border border-border bg-bg-card px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="info">{question.game_code}</Badge>
                    <Badge variant={question.is_active ? 'success' : 'default'}>
                      {question.is_active ? 'active' : 'off'}
                    </Badge>
                    {question.difficulty && (
                      <Badge variant="warning">{question.difficulty}</Badge>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-text-primary">
                    {String(
                      question.question_data.question ??
                        question.question_data.text ??
                        JSON.stringify(question.question_data),
                    )}
                  </p>
                  <p className="mt-1 text-[10px] text-text-muted">
                    {formatDateTime(question.created_at)} · {question.id.slice(0, 8)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => openEdit(question)}
                >
                  Изменить
                </Button>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <div className="rounded-xl border border-border bg-bg-card px-4 py-10 text-center text-sm text-text-secondary">
              Вопросов не найдено
            </div>
          )}
        </div>
      )}

      <Pagination meta={questionsQuery.data?.meta} onPageChange={setPage} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Изменить вопрос' : 'Новый вопрос'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button onClick={submit} loading={saveMutation.isPending}>
              Сохранить
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Игра"
              options={(gamesQuery.data ?? []).map((game) => ({
                value: game.code,
                label: game.name,
              }))}
              value={gameCode}
              disabled={Boolean(editing)}
              onChange={(event) => setGameCode(event.target.value)}
            />
            <Select
              label="Сложность"
              options={[
                { value: '', label: 'Не указана' },
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
            />
          </div>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-text-secondary">
              <Code2 className="h-4 w-4" />
              question_data (JSON)
            </span>
            <textarea
              className="min-h-40 w-full rounded-xl border border-border bg-bg-secondary p-3 font-mono text-xs text-text-primary outline-none focus:border-accent-primary/70"
              value={questionData}
              onChange={(event) => setQuestionData(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-text-secondary">
              correct_answer (JSON)
            </span>
            <textarea
              className="min-h-20 w-full rounded-xl border border-border bg-bg-secondary p-3 font-mono text-xs text-text-primary outline-none focus:border-accent-primary/70"
              value={correctAnswer}
              onChange={(event) => setCorrectAnswer(event.target.value)}
            />
          </label>

          {jsonError && (
            <p className="rounded-lg border border-red/25 bg-red/10 px-3 py-2 text-xs text-red">
              {jsonError}
            </p>
          )}

          <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-sm text-text-primary">
            Активен
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 accent-accent-primary"
            />
          </label>
        </div>
      </Modal>
    </div>
  );
}
