import React, { useState } from 'react';
import { Settings, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SlippageSettingsProps {
  slippage: number;
  onSlippageChange: (slippage: number) => void;
  className?: string;
}

export const SlippageSettings: React.FC<SlippageSettingsProps> = ({
  slippage,
  onSlippageChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customSlippage, setCustomSlippage] = useState(slippage.toString());

  const presetSlippages = [0.1, 0.5, 1.0, 2.0];

  const handleCustomSlippageChange = (value: string) => {
    setCustomSlippage(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      onSlippageChange(numValue);
    }
  };

  const handlePresetClick = (preset: number) => {
    onSlippageChange(preset);
    setCustomSlippage(preset.toString());
  };

  const isHighSlippage = slippage > 5;
  const isMediumSlippage = slippage > 1 && slippage <= 5;

  return (
    <div className={`relative ${className}`}>
      {/* Slippage Display Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-800/50 px-3 py-1 rounded-lg"
      >
        <Settings className="w-4 h-4" />
        <span className="text-sm font-medium">{slippage}%</span>
        {isHighSlippage && (
          <AlertTriangle className="w-3 h-3 text-red-400" />
        )}
        {isMediumSlippage && (
          <AlertTriangle className="w-3 h-3 text-yellow-400" />
        )}
      </Button>

      {/* Settings Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-10">
          <Card className="bg-gray-900/95 border border-gray-700 shadow-2xl w-80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-white flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-400" />
                Slippage Tolerance
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Preset Options */}
              <div>
                <div className="text-sm text-gray-300 mb-2">Quick Settings</div>
                <div className="grid grid-cols-2 gap-2">
                  {presetSlippages.map((preset) => (
                    <Button
                      key={preset}
                      variant={slippage === preset ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePresetClick(preset)}
                      className={`text-sm ${
                        slippage === preset 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      {preset}%
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Slippage */}
              <div>
                <div className="text-sm text-gray-300 mb-2">Custom</div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={customSlippage}
                    onChange={(e) => handleCustomSlippageChange(e.target.value)}
                    placeholder="0.5"
                    min="0"
                    max="50"
                    step="0.1"
                    className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                  <span className="text-gray-400 text-sm">%</span>
                </div>
              </div>

              {/* Slippage Warnings */}
              {isHighSlippage && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-400">
                      <div className="font-medium mb-1">High Slippage Warning</div>
                      <div className="text-xs">
                        Your transaction may be executed at a significantly different price than expected.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isMediumSlippage && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-400">
                      <div className="font-medium mb-1">Medium Slippage</div>
                      <div className="text-xs">
                        Consider using a lower slippage for better price protection.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="text-xs text-gray-500 bg-gray-800/50 rounded p-2">
                <div className="font-medium mb-1">What is Slippage?</div>
                <div>
                  Slippage is the difference between the expected price and the actual execution price. 
                  Higher slippage means your transaction is more likely to succeed but may execute at a worse price.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backdrop to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}; 