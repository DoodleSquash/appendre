import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, Upload, Wand2, Loader2, BookOpen, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { generateQuizWithAI } from '@/lib/api/quizApi';
import { toast } from 'sonner';

export default function AIQuizGenerator({ onQuizGenerated }) {
  const [activeTab, setActiveTab] = useState('topic');
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState('10');
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
  };

  const generateQuiz = async () => {
    setIsGenerating(true);
    try {
      let promptSource = '';
      let sourceType = 'ai_topic';

      if (activeTab === 'topic') {
        promptSource = topic || 'General Knowledge';
        sourceType = 'ai_topic';
      } else if (activeTab === 'text') {
        promptSource = text || 'Custom provided text';
        sourceType = 'ai_text';
      } else if (activeTab === 'pdf') {
        // Placeholder: use file name as context; actual upload happens in backend integration
        promptSource = file?.name ? `Content from file: ${file.name}` : 'Uploaded document';
        sourceType = 'ai_pdf';
      }

      const result = await generateQuizWithAI({
        topic: promptSource,
        difficulty,
        numQuestions: Number(numQuestions) || 10,
        sourceType
      });

      if (!result) {
        throw new Error('No quiz generated. Please try again.');
      }

      const quizData = {
        title: result.title || 'AI Generated Quiz',
        description: result.description || `A quiz about ${promptSource}`,
        category: result.category || 'ai_generated',
        difficulty: result.difficulty || difficulty,
        questions: (result.questions || []).map((q, index) => ({
          id: q.id || `q${index + 1}`,
          question: q.question,
          type: q.type || 'multiple_choice',
          options: q.options?.length ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
          correct_answer: q.correct_answer ?? 0,
          time_limit: q.time_limit || 20,
          points: q.points || 1000,
        })),
        cover_image: result.cover_image || null,
        time_per_question: result.time_per_question || 20,
        is_public: false,
        play_count: 0,
        source_type: sourceType
      };

      onQuizGenerated(quizData);
      toast.success('AI quiz generated successfully!');
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      toast.error(error.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = () => {
    if (activeTab === 'topic') return topic.trim().length >= 3;
    if (activeTab === 'text') return text.trim().length >= 50;
    if (activeTab === 'pdf') return file !== null;
    return false;
  };
  
  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">AI Quiz Generator</h2>
          <p className="text-slate-500">Create quizzes in seconds with AI</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="topic" className="gap-2">
            <Zap className="w-4 h-4" /> Topic
          </TabsTrigger>
          <TabsTrigger value="text" className="gap-2">
            <FileText className="w-4 h-4" /> Text
          </TabsTrigger>
          <TabsTrigger value="pdf" className="gap-2">
            <Upload className="w-4 h-4" /> PDF
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="topic" className="m-0">
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic">Enter a topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., World War II, JavaScript basics, Solar System..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="text" className="m-0">
            <div className="space-y-4">
              <div>
                <Label htmlFor="text">Paste your content</Label>
                <Textarea
                  id="text"
                  placeholder="Paste any text, article, or notes here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="mt-2 min-h-[200px]"
                />
                <p className="text-sm text-slate-500 mt-1">
                  {text.length} characters (minimum 50)
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="pdf" className="m-0">
            <div className="space-y-4">
              <div>
                <Label>Upload a PDF or Image</Label>
                <div className="mt-2 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-violet-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    {file ? (
                      <p className="text-violet-600 font-medium">{file.name}</p>
                    ) : (
                      <>
                        <p className="text-slate-600 font-medium">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          PDF, PNG, or JPG (max 10MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <Label>Number of Questions</Label>
          <Select value={numQuestions} onValueChange={setNumQuestions}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 questions</SelectItem>
              <SelectItem value="10">10 questions</SelectItem>
              <SelectItem value="15">15 questions</SelectItem>
              <SelectItem value="20">20 questions</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
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
      </div>
      
      <Button 
        onClick={generateQuiz}
        disabled={!canGenerate() || isGenerating}
        className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white py-6 text-lg font-semibold gap-3"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Quiz...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            Generate Quiz with AI
          </>
        )}
      </Button>
    </motion.div>
  );
}