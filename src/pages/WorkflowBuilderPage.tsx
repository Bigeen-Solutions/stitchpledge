import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  GitBranch, 
  Lock, 
  Unlock, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  History,
  FileCode2,
  Trash2,
  Save
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

// --- Mock Data (To be replaced by actual API calls) ---
interface TemplateVersion {
  id: string;
  versionNumber: string;
  isActive: boolean;
  activeGarments: number;
  createdAt: string;
  graph: {
    stages: string[];
  };
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  versions: TemplateVersion[];
}

const MOCK_TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'Bespoke Suit',
    description: 'High-end suit production with multiple fittings.',
    category: 'Suit',
    versions: [
      {
        id: 'v1.3',
        versionNumber: '1.3',
        isActive: true,
        activeGarments: 12,
        createdAt: '2024-05-01',
        graph: { stages: ['Intake', 'Cutting', 'Toile Fitting', 'Sewing', 'Finishing', 'Collection'] }
      },
      {
        id: 'v1.2',
        versionNumber: '1.2',
        isActive: false,
        activeGarments: 5,
        createdAt: '2024-04-10',
        graph: { stages: ['Intake', 'Cutting', 'Sewing', 'Finishing', 'Collection'] }
      }
    ]
  },
  {
    id: 't2',
    name: 'Standard Agbada',
    description: 'Traditional agbada with embroidery stage.',
    category: 'Agbada',
    versions: [
      {
        id: 'v1.0',
        versionNumber: '1.0',
        isActive: true,
        activeGarments: 0,
        createdAt: '2024-05-05',
        graph: { stages: ['Intake', 'Cutting', 'Embroidery', 'Finishing', 'Collection'] }
      }
    ]
  }
];

export const WorkflowBuilderPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(MOCK_TEMPLATES[0]);
  const [selectedVersion, setSelectedVersion] = useState<TemplateVersion | null>(MOCK_TEMPLATES[0].versions[0]);
  const [isDrafting, setIsDrafting] = useState(false);

  const canEdit = selectedVersion ? selectedVersion.activeGarments === 0 : true;

  const handleCreateDraft = () => {
    setIsDrafting(true);
    // Logic to clone version and increment version number would go here
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Workflow Template Builder
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Define the operational blueprint for your workshop.</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 px-6">
            <Plus size={20} /> New Template
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar: Template List */}
          <div className="col-span-3 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 px-2">Templates</h2>
            <div className="space-y-1">
              {MOCK_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setSelectedVersion(template.versions[0]);
                    setIsDrafting(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between group ${
                    selectedTemplate?.id === template.id 
                    ? 'bg-slate-800/50 border border-slate-700 text-indigo-400' 
                    : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-medium">{template.name}</span>
                  <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${selectedTemplate?.id === template.id ? 'opacity-100' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Main Workspace */}
          <div className="col-span-9 space-y-6">
            {selectedTemplate && selectedVersion ? (
              <>
                {/* Template Info & Version Selector */}
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-slate-100">{selectedTemplate.name}</CardTitle>
                      <p className="text-slate-400 text-sm mt-1">{selectedTemplate.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex bg-slate-800 p-1 rounded-md">
                        {selectedTemplate.versions.map(v => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVersion(v)}
                            className={`px-3 py-1 text-xs rounded transition-all ${
                              selectedVersion.id === v.id 
                              ? 'bg-indigo-600 text-white shadow-lg' 
                              : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            v{v.versionNumber}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="border-t border-slate-800 pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-6">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Status</span>
                          <div className="flex items-center gap-2">
                            {selectedVersion.isActive ? (
                              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1 px-2 py-0">
                                <CheckCircle2 size={12} /> Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-slate-400 border-slate-700">Archived</Badge>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Active Garments</span>
                          <p className="text-lg font-semibold text-slate-200">{selectedVersion.activeGarments}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Created</span>
                          <p className="text-sm font-medium text-slate-300">{selectedVersion.createdAt}</p>
                        </div>
                      </div>

                      {canEdit ? (
                        <div className="flex gap-2">
                           <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                             <Trash2 size={18} className="mr-2" /> Delete Version
                           </Button>
                           <Button className="bg-indigo-600 hover:bg-indigo-500">
                             <Save size={18} className="mr-2" /> Save Changes
                           </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={handleCreateDraft}
                          className="bg-amber-600 hover:bg-amber-500 text-white gap-2 shadow-lg shadow-amber-900/20"
                        >
                          <GitBranch size={18} /> Create New Version
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Edit Warning */}
                {!canEdit && (
                  <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200">
                    <AlertCircle size={20} className="shrink-0" />
                    <p className="text-sm">
                      <span className="font-bold">Active-Mutation Guard:</span> This version is currently linked to <strong>{selectedVersion.activeGarments} active garments</strong>. Direct editing is prohibited to prevent state corruption. Create a new version to modify this blueprint.
                    </p>
                  </div>
                )}

                {/* Stage Editor (DAG Visualization Placeholder) */}
                <div className="grid grid-cols-1 gap-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <FileCode2 className="text-indigo-400" /> 
                    Operational Blueprint (DAG)
                  </h3>
                  
                  <div className="space-y-3 relative">
                    {selectedVersion.graph.stages.map((stage, index) => (
                      <div key={index} className="relative group">
                        {index < selectedVersion.graph.stages.length - 1 && (
                          <div className="absolute left-[26px] top-12 w-0.5 h-8 bg-gradient-to-b from-indigo-500 to-slate-800 z-0" />
                        )}
                        <div className={`
                          relative z-10 flex items-center justify-between p-4 rounded-xl border transition-all
                          ${canEdit ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' : 'bg-slate-900/30 border-slate-800/50 grayscale-[0.5]'}
                        `}>
                          <div className="flex items-center gap-4">
                            <div className={`
                              w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                              ${canEdit ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}
                            `}>
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-100">{stage}</h4>
                              <p className="text-xs text-slate-500">Constraint: All dependencies must be COMPLETED</p>
                            </div>
                          </div>
                          
                          {canEdit && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-red-400">
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {canEdit && (
                      <button className="w-full py-4 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 hover:border-indigo-500/50 hover:text-indigo-400 transition-all flex items-center justify-center gap-2 group">
                        <Plus size={20} className="group-hover:scale-110 transition-transform" /> Add Production Stage
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 space-y-4">
                <div className="p-6 bg-slate-900 rounded-full border border-slate-800 shadow-2xl">
                   <History size={64} className="opacity-20" />
                </div>
                <p>Select a template to view its operational blueprint.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilderPage;
