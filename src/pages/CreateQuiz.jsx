import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, GripVertical, Save, Eye,
  Sparkles, Clock, Award, ChevronDown, ChevronUp,
  Play, Loader2, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getQuizById, createQuiz, updateQuiz } from '@/services/quizService';
import { generateQuizWithAI } from '@/lib/api/quizApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AIQuizGenerator from '@/components/quiz/AIQuizGenerator';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const defaultQuestion = {
  question: '',
  type: 'multiple_choice',
  options: ['', '', '', ''],
  correct_answer: 0,
  time_limit: 20,
  points: 1000
};

export default function CreateQuiz() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('ai');
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    category: 'general',
    difficulty: 'medium',
    questions: [],
    is_public: false,
    time_per_question: 20
  });
  const [expandedQuestion, setExpandedQuestion] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Check for edit mode
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('editId');

  const { data: existingQuiz, isLoading: loadingQuiz, error: loadError } = useQuery({
    queryKey: ['quiz', editId],
    queryFn: async () => {
      const result = await getQuizById(editId);
      return result;
    },
    enabled: !!editId,
    retry: false
  });

  useEffect(() => {
    if (existingQuiz) {
      setQuiz(existingQuiz);
      setActiveTab('manual');
    }
  }, [existingQuiz]);

  const saveMutation = useMutation({
    mutationFn: async (quizData) => {
      if (editId) {
        return updateQuiz(editId, quizData);
      } else {
        return createQuiz(quizData);
      }
    },
    onSuccess: (result) => {
      // Ensure dashboard picks up latest quizzes immediately
      queryClient.invalidateQueries({ queryKey: ['myQuizzes'] });
      toast.success(editId ? 'Quiz updated!' : 'Quiz created!');
      window.location.href = createPageUrl('Dashboard');
    },
    onError: (error) => {
      toast.error('Failed to save quiz');
      setIsSaving(false);
    }
  });

  const handleAIGenerated = (generatedQuiz) => {
    setQuiz({
      ...quiz,
      ...generatedQuiz
    });
    setActiveTab('manual');
    setExpandedQuestion(0);
  };

  const addQuestion = () => {
    const newQuestion = {
      ...defaultQuestion,
      id: `q_${Date.now()}`
    };
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion]
    });
    setExpandedQuestion(quiz.questions.length);
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const deleteQuestion = (index) => {
    const newQuestions = quiz.questions.filter((_, i) => i !== index);
    setQuiz({ ...quiz, questions: newQuestions });
    if (expandedQuestion >= newQuestions.length) {
      setExpandedQuestion(Math.max(0, newQuestions.length - 1));
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(quiz.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setQuiz({ ...quiz, questions: items });
  };

  const handleSave = () => {
    if (!quiz.title.trim()) {
      toast.error('Please add a title');
      return;
    }
    if (quiz.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    const invalidQuestions = quiz.questions.filter(
      q => !q.question.trim() || q.options.some(o => !o.trim())
    );

    if (invalidQuestions.length > 0) {
      toast.error('Please complete all questions and options');
      return;
    }

    setIsSaving(true);
    saveMutation.mutate(quiz);
  };

  if (loadingQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = createPageUrl('Dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {editId ? 'Edit Quiz' : 'Create Quiz'}
              </h1>
              <p className="text-sm text-slate-500">
                {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Eye className="w-4 h-4" /> Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editId ? 'Update' : 'Save Quiz'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="ai">
              AI Generator
            </TabsTrigger>
            <TabsTrigger value="manual">
              Manual Editor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="m-0">
            <AIQuizGenerator onQuizGenerated={handleAIGenerated} />
          </TabsContent>

          <TabsContent value="manual" className="m-0">
            {/* Quiz Details */}
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-lg font-bold text-slate-800 mb-4">Quiz Details</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Enter quiz title..."
                    value={quiz.title}
                    onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="What's this quiz about?"
                    value={quiz.description}
                    onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select
                    value={quiz.category}
                    onValueChange={(v) => setQuiz({ ...quiz, category: v })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Knowledge</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="arts">Arts & Culture</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Difficulty</Label>
                  <Select
                    value={quiz.difficulty}
                    onValueChange={(v) => setQuiz({ ...quiz, difficulty: v })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="adaptive">Adaptive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl md:col-span-2">
                  <div>
                    <Label>Make Public</Label>
                    <p className="text-sm text-slate-500">Allow others to discover this quiz</p>
                  </div>
                  <Switch
                    checked={quiz.is_public}
                    onCheckedChange={(v) => setQuiz({ ...quiz, is_public: v })}
                  />
                </div>
              </div>
            </motion.div>

            {/* Questions List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Questions</h2>
                <Button onClick={addQuestion} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" /> Add Question
                </Button>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="questions">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {quiz.questions.map((question, qIndex) => (
                          <Draggable key={question.id || qIndex} draggableId={question.id || `q-${qIndex}`} index={qIndex}>
                            {(provided, snapshot) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`bg-white rounded-2xl shadow-sm border ${snapshot.isDragging ? 'border-violet-300 shadow-lg' : 'border-slate-100'
                                  }`}
                              >
                                {/* Question Header */}
                                <div
                                  className="flex items-center gap-3 p-4 cursor-pointer"
                                  onClick={() => setExpandedQuestion(expandedQuestion === qIndex ? -1 : qIndex)}
                                >
                                  <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600">
                                    <GripVertical className="w-5 h-5" />
                                  </div>

                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">
                                    {qIndex + 1}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-800 truncate">
                                      {question.question || 'New Question'}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      {question.type === 'true_false' ? 'True/False' : 'Multiple Choice'} • {question.time_limit}s • {question.points} pts
                                    </p>
                                  </div>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteQuestion(qIndex);
                                    }}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>

                                  {expandedQuestion === qIndex ? (
                                    <ChevronUp className="w-5 h-5 text-slate-400" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-slate-400" />
                                  )}
                                </div>

                                {/* Question Content */}
                                <AnimatePresence>
                                  {expandedQuestion === qIndex && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="p-4 pt-0 space-y-4 border-t border-slate-100">
                                        <div>
                                          <Label>Question</Label>
                                          <Textarea
                                            placeholder="Enter your question..."
                                            value={question.question}
                                            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                            className="mt-2"
                                          />
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                          <div>
                                            <Label>Type</Label>
                                            <Select
                                              value={question.type}
                                              onValueChange={(v) => updateQuestion(qIndex, 'type', v)}
                                            >
                                              <SelectTrigger className="mt-2">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                                <SelectItem value="true_false">True/False</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          <div>
                                            <Label>Time (seconds)</Label>
                                            <Input
                                              type="number"
                                              min={5}
                                              max={120}
                                              value={question.time_limit}
                                              onChange={(e) => updateQuestion(qIndex, 'time_limit', parseInt(e.target.value))}
                                              className="mt-2"
                                            />
                                          </div>

                                          <div>
                                            <Label>Points</Label>
                                            <Input
                                              type="number"
                                              min={100}
                                              step={100}
                                              value={question.points}
                                              onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                                              className="mt-2"
                                            />
                                          </div>
                                        </div>

                                        <div>
                                          <Label>Answer Options</Label>
                                          <p className="text-sm text-slate-500 mb-2">Click to mark as correct answer</p>
                                          <div className="grid grid-cols-2 gap-3">
                                            {question.options.map((option, oIndex) => (
                                              <div
                                                key={oIndex}
                                                className={`relative rounded-xl border-2 transition-all cursor-pointer ${question.correct_answer === oIndex
                                                  ? 'border-emerald-500 bg-emerald-50'
                                                  : 'border-slate-200 hover:border-slate-300'
                                                  }`}
                                                onClick={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                                              >
                                                <Input
                                                  placeholder={`Option ${oIndex + 1}`}
                                                  value={option}
                                                  onChange={(e) => {
                                                    e.stopPropagation();
                                                    updateOption(qIndex, oIndex, e.target.value);
                                                  }}
                                                  onClick={(e) => e.stopPropagation()}
                                                  onFocus={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                                                  className="border-0 focus-visible:ring-0"
                                                />
                                                {question.correct_answer === oIndex && (
                                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-sm font-medium">
                                                    ✓ Correct
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {quiz.questions.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">No questions yet</p>
                  <Button onClick={addQuestion} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" /> Add First Question
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}