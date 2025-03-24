
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Plus, Trash, X, Save, RefreshCw } from 'lucide-react';
import { AutoRule, RuleCondition } from '@/lib/types';
import { getAutoRules, saveAutoRule, deleteAutoRule } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAnimeList } from '@/hooks/useAnimeList';
import { v4 as uuidv4 } from '@/lib/utils';

const AutoRules: React.FC = () => {
  const [rules, setRules] = useState<AutoRule[]>([]);
  const [editingRule, setEditingRule] = useState<AutoRule | null>(null);
  const { applyRules } = useAnimeList();

  // Load rules on mount
  useEffect(() => {
    const savedRules = getAutoRules();
    setRules(savedRules);
  }, []);

  // Create a new rule
  const handleCreateRule = () => {
    const newRule: AutoRule = {
      id: uuidv4(),
      name: `Rule ${rules.length + 1}`,
      enabled: true,
      conditions: [
        {
          field: 'genre',
          operator: 'contains',
          value: ''
        }
      ]
    };
    
    setEditingRule(newRule);
  };

  // Edit an existing rule
  const handleEditRule = (rule: AutoRule) => {
    setEditingRule({ ...rule });
  };

  // Update rule name
  const handleUpdateRuleName = (name: string) => {
    if (editingRule) {
      setEditingRule({ ...editingRule, name });
    }
  };

  // Add a condition to the editing rule
  const handleAddCondition = () => {
    if (editingRule) {
      setEditingRule({
        ...editingRule,
        conditions: [
          ...editingRule.conditions,
          {
            field: 'genre',
            operator: 'contains',
            value: ''
          }
        ]
      });
    }
  };

  // Remove a condition from the editing rule
  const handleRemoveCondition = (index: number) => {
    if (editingRule) {
      const newConditions = [...editingRule.conditions];
      newConditions.splice(index, 1);
      setEditingRule({
        ...editingRule,
        conditions: newConditions
      });
    }
  };

  // Update a condition
  const handleUpdateCondition = (index: number, field: keyof RuleCondition, value: any) => {
    if (editingRule) {
      const newConditions = [...editingRule.conditions];
      newConditions[index] = {
        ...newConditions[index],
        [field]: value
      };
      setEditingRule({
        ...editingRule,
        conditions: newConditions
      });
    }
  };

  // Save the editing rule
  const handleSaveRule = () => {
    if (editingRule) {
      saveAutoRule(editingRule);
      
      const updatedRules = getAutoRules();
      setRules(updatedRules);
      setEditingRule(null);
    }
  };

  // Delete a rule
  const handleDeleteRule = (ruleId: string) => {
    deleteAutoRule(ruleId);
    
    const updatedRules = getAutoRules();
    setRules(updatedRules);
    
    if (editingRule?.id === ruleId) {
      setEditingRule(null);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingRule(null);
  };

  // Toggle rule enabled state
  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    const ruleToUpdate = rules.find(r => r.id === ruleId);
    if (ruleToUpdate) {
      const updatedRule = { ...ruleToUpdate, enabled };
      saveAutoRule(updatedRule);
      
      const updatedRules = getAutoRules();
      setRules(updatedRules);
    }
  };

  // Apply rules to anime lists
  const handleApplyRules = () => {
    applyRules();
  };

  // Define field options
  const fieldOptions = [
    { value: 'genre', label: 'Genre' },
    { value: 'studio', label: 'Studio' },
    { value: 'score', label: 'Score' },
    { value: 'title', label: 'Title' }
  ];

  // Define operator options based on field
  const getOperatorOptions = (field: string) => {
    switch (field) {
      case 'genre':
      case 'studio':
      case 'title':
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'equals', label: 'Equals' }
        ];
      case 'score':
        return [
          { value: 'greater', label: 'Greater than' },
          { value: 'less', label: 'Less than' },
          { value: 'equals', label: 'Equals' }
        ];
      default:
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'equals', label: 'Equals' }
        ];
    }
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl">Auto-Selection Rules</CardTitle>
          <CardDescription>
            Create rules to automatically select anime based on criteria
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <Button onClick={handleCreateRule}>
              <Plus className="mr-2 h-4 w-4" />
              Create Rule
            </Button>
            
            <Button
              variant="outline"
              onClick={handleApplyRules}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Apply Rules
            </Button>
          </div>
          
          {rules.length === 0 && !editingRule && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No rules created yet. Create a rule to automatically select anime.
              </AlertDescription>
            </Alert>
          )}
          
          {!editingRule && rules.length > 0 && (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div 
                  key={rule.id}
                  className="flex items-center p-3 border rounded-md"
                >
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={rule.enabled}
                        onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                      />
                      <span className={rule.enabled ? 'font-medium' : 'text-muted-foreground'}>
                        {rule.name}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {rule.conditions.map((condition, i) => (
                        <span key={i}>
                          {i > 0 && ' AND '}
                          {condition.field} {condition.operator} {condition.value}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditRule(rule)}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {editingRule && (
            <div className="border rounded-md p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input
                  id="rule-name"
                  value={editingRule.name}
                  onChange={(e) => handleUpdateRuleName(e.target.value)}
                  className="glass"
                />
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Conditions</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddCondition}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                
                {editingRule.conditions.map((condition, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-4">
                      <Select
                        value={condition.field}
                        onValueChange={(value: any) => handleUpdateCondition(index, 'field', value)}
                      >
                        <SelectTrigger className="glass">
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-3">
                      <Select
                        value={condition.operator}
                        onValueChange={(value: any) => handleUpdateCondition(index, 'operator', value)}
                      >
                        <SelectTrigger className="glass">
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {getOperatorOptions(condition.field).map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-4">
                      <Input
                        value={String(condition.value)}
                        onChange={(e) => {
                          const value = condition.field === 'score' 
                            ? parseFloat(e.target.value) || 0 
                            : e.target.value;
                          handleUpdateCondition(index, 'value', value);
                        }}
                        type={condition.field === 'score' ? 'number' : 'text'}
                        step={condition.field === 'score' ? '0.1' : undefined}
                        placeholder="Value"
                        className="glass"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCondition(index)}
                        disabled={editingRule.conditions.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        
        {editingRule && (
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveRule}>
              Save Rule
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default AutoRules;
