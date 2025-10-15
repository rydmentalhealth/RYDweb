'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingItem {
  id: string;
  title: string;
  description?: string;
  category: 'ORIENTATION' | 'DOCUMENTATION' | 'TRAINING' | 'COMPLIANCE' | 'WELCOME';
  isRequired: boolean;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OnboardingStats {
  totalItems: number;
  completedItems: number;
  requiredItems: number;
  completedRequiredItems: number;
  completionPercentage: number;
  requiredCompletionPercentage: number;
}

interface OnboardingChecklistProps {
  employeeId: string;
  onUpdate?: () => void;
}

const categoryColors = {
  ORIENTATION: 'bg-blue-100 text-blue-800',
  DOCUMENTATION: 'bg-green-100 text-green-800',
  TRAINING: 'bg-purple-100 text-purple-800',
  COMPLIANCE: 'bg-orange-100 text-orange-800',
  WELCOME: 'bg-pink-100 text-pink-800',
};

const categoryIcons = {
  ORIENTATION: '📋',
  DOCUMENTATION: '📄',
  TRAINING: '🎓',
  COMPLIANCE: '✅',
  WELCOME: '👋',
};

export default function OnboardingChecklist({ employeeId, onUpdate }: OnboardingChecklistProps) {
  const [items, setItems] = useState<OnboardingItem[]>([]);
  const [stats, setStats] = useState<OnboardingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchChecklist = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/employees/${employeeId}/onboarding`);
      if (!response.ok) {
        throw new Error('Failed to fetch onboarding checklist');
      }

      const data = await response.json();
      setItems(data.items);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching onboarding checklist:', error);
      toast.error('Failed to fetch onboarding checklist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchChecklist();
    }
  }, [employeeId]);

  const updateItem = async (itemId: string, isCompleted: boolean) => {
    try {
      setUpdating(itemId);
      const response = await fetch(`/api/employees/${employeeId}/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          isCompleted,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update onboarding item');
      }

      const updatedItem = await response.json();
      
      // Update local state
      setItems(prev => prev.map(item => 
        item.id === itemId ? updatedItem : item
      ));

      // Recalculate stats
      const updatedItems = items.map(item => 
        item.id === itemId ? updatedItem : item
      );
      
      const totalItems = updatedItems.length;
      const completedItems = updatedItems.filter(item => item.isCompleted).length;
      const requiredItems = updatedItems.filter(item => item.isRequired).length;
      const completedRequiredItems = updatedItems.filter(item => item.isRequired && item.isCompleted).length;

      setStats({
        totalItems,
        completedItems,
        requiredItems,
        completedRequiredItems,
        completionPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
        requiredCompletionPercentage: requiredItems > 0 ? Math.round((completedRequiredItems / requiredItems) * 100) : 0,
      });

      toast.success(`Item ${isCompleted ? 'completed' : 'marked as incomplete'}`);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating onboarding item:', error);
      toast.error('Failed to update onboarding item');
    } finally {
      setUpdating(null);
    }
  };

  const groupItemsByCategory = (items: OnboardingItem[]) => {
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, OnboardingItem[]>);

    // Sort items within each category
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => {
        // Required items first
        if (a.isRequired && !b.isRequired) return -1;
        if (!a.isRequired && b.isRequired) return 1;
        // Then by creation date
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    });

    return grouped;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Failed to load onboarding checklist</p>
        </CardContent>
      </Card>
    );
  }

  const groupedItems = groupItemsByCategory(items);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
          <CardDescription>
            Track the completion of essential onboarding tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.completedItems}/{stats.totalItems}
              </div>
              <p className="text-sm text-muted-foreground">Total Completed</p>
              <Progress value={stats.completionPercentage} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.completedRequiredItems}/{stats.requiredItems}
              </div>
              <p className="text-sm text-muted-foreground">Required Completed</p>
              <Progress value={stats.requiredCompletionPercentage} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.totalItems - stats.completedItems}
              </div>
              <p className="text-sm text-muted-foreground">Remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items by Category */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                <div>
                  <CardTitle className="capitalize">{category.toLowerCase()}</CardTitle>
                  <CardDescription>
                    {categoryItems.filter(item => item.isCompleted).length} of {categoryItems.length} completed
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border ${
                      item.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex-shrink-0 pt-1">
                      {updating === item.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      ) : (
                        <Checkbox
                          checked={item.isCompleted}
                          onCheckedChange={(checked) => updateItem(item.id, checked as boolean)}
                          disabled={updating === item.id}
                        />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-medium text-sm ${
                          item.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {item.title}
                        </h4>
                        {item.isRequired && (
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        )}
                        <Badge className={`text-xs ${categoryColors[item.category]}`}>
                          {item.category}
                        </Badge>
                      </div>
                      
                      {item.description && (
                        <p className={`text-sm ${
                          item.isCompleted ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {item.description}
                        </p>
                      )}
                      
                      {item.isCompleted && item.completedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Completed on {new Date(item.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0">
                      {item.isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completion Status */}
      {stats.requiredCompletionPercentage === 100 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center space-x-3 py-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Onboarding Complete!</h3>
              <p className="text-sm text-green-700">
                All required onboarding tasks have been completed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {stats.requiredCompletionPercentage < 100 && stats.requiredItems > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center space-x-3 py-4">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-800">Incomplete Required Tasks</h3>
              <p className="text-sm text-orange-700">
                {stats.requiredItems - stats.completedRequiredItems} required tasks still need to be completed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
