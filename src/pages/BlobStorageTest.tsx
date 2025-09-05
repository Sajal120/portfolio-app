import React, { useState } from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { uploadToBlob, listBlobFiles, deleteFromBlob } from '../lib/blobStorage';
import toast from 'react-hot-toast';

const BlobStorageTest: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [testResults, setTestResults] = useState<{
    upload: boolean | null;
    list: boolean | null;
    delete: boolean | null;
  }>({
    upload: null,
    list: null,
    delete: null
  });
  const [testFileUrl, setTestFileUrl] = useState<string>('');

  const runFullTest = async () => {
    setTestResults({ upload: null, list: null, delete: null });
    setUploading(true);

    try {
      // Test 1: Upload a test file
      console.log('Testing upload...');
      const testBlob = new Blob(['Test file content'], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test-file.txt', { type: 'text/plain' });
      
      const { data: uploadData, error: uploadError } = await uploadToBlob(testFile, 'test');
      
      if (uploadError || !uploadData) {
        setTestResults(prev => ({ ...prev, upload: false }));
        toast.error(`Upload test failed: ${uploadError?.message || 'Unknown error'}`);
        return;
      }

      setTestResults(prev => ({ ...prev, upload: true }));
      setTestFileUrl(uploadData.url);
      toast.success('Upload test passed!');

      // Wait a moment for the upload to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 2: List files
      console.log('Testing file listing...');
      console.log('Looking for uploaded file:', uploadData.pathname);
      
      // Try listing with the specific prefix first
      let { data: listData, error: listError } = await listBlobFiles('test');
      
      // If that doesn't work, try listing all files
      if (!listData || listData.length === 0) {
        console.log('No files found with "test" prefix, trying to list all files...');
        const allFilesResult = await listBlobFiles();
        listData = allFilesResult.data;
        listError = allFilesResult.error;
      }
      
      if (listError) {
        setTestResults(prev => ({ ...prev, list: false }));
        toast.error(`List test failed: ${listError}`);
        return;
      }

      if (!listData || listData.length === 0) {
        setTestResults(prev => ({ ...prev, list: false }));
        toast.error('List test failed: No files found');
        console.log('No files found in blob storage');
        return;
      }

      console.log('Found files:', listData.map(f => f.pathname));
      
      // Check if our uploaded file is in the list
      const uploadedFile = listData.find(file => 
        file.url === uploadData.url || 
        file.pathname === uploadData.pathname ||
        file.pathname.includes('test-file')
      );

      if (!uploadedFile) {
        setTestResults(prev => ({ ...prev, list: false }));
        toast.error('List test failed: Uploaded file not found in list');
        console.log('Uploaded file not found in list. Looking for:', uploadData.pathname);
        console.log('Available files:', listData.map(f => f.pathname));
        return;
      }

      setTestResults(prev => ({ ...prev, list: true }));
      toast.success('List test passed!');

      // Test 3: Delete the test file
      console.log('Testing file deletion...');
      const { success: deleteSuccess, error: deleteError } = await deleteFromBlob(uploadData.url);
      
      if (!deleteSuccess) {
        setTestResults(prev => ({ ...prev, delete: false }));
        toast.error(`Delete test failed: ${deleteError || 'Unknown error'}`);
        return;
      }

      setTestResults(prev => ({ ...prev, delete: true }));
      toast.success('Delete test passed!');
      toast.success('All Vercel Blob tests passed! 🎉');

    } catch (error) {
      console.error('Test failed:', error);
      toast.error(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const TestResult: React.FC<{ test: string; result: boolean | null }> = ({ test, result }) => (
    <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5">
      <span className="font-medium">{test}</span>
      <div className="flex items-center">
        {result === null ? (
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
        ) : result ? (
          <Check className="w-5 h-5 text-green-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-400" />
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2" size={24} />
            Vercel Blob Storage Test
          </CardTitle>
          <CardDescription>
            Test the integration with Vercel Blob Storage to ensure everything is working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Button */}
          <Button 
            onClick={runFullTest} 
            disabled={uploading}
            className="w-full btn-glow"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Running Tests...
              </>
            ) : (
              <>
                <Upload size={16} className="mr-2" />
                Run Vercel Blob Tests
              </>
            )}
          </Button>

          {/* Test Results */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Test Results</h3>
            <TestResult test="File Upload" result={testResults.upload} />
            <TestResult test="File Listing" result={testResults.list} />
            <TestResult test="File Deletion" result={testResults.delete} />
          </div>

          {/* Configuration Check */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Configuration Check</h3>
            <div className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5">
              <span className="font-medium">VITE_BLOB_READ_WRITE_TOKEN</span>
              <div className="flex items-center">
                {import.meta.env.VITE_BLOB_READ_WRITE_TOKEN ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            </div>
          </div>

          {/* Test File URL */}
          {testFileUrl && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Test File URL</h3>
              <div className="p-3 border border-white/10 rounded-lg bg-white/5">
                <code className="text-sm break-all text-green-400">
                  {testFileUrl}
                </code>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Setup Instructions</h3>
            <div className="p-4 border border-orange-400/20 rounded-lg bg-orange-400/5">
              <p className="text-sm text-orange-200 mb-2">
                If the configuration check fails:
              </p>
              <ol className="text-sm space-y-1 text-orange-200/80">
                <li>1. Create a Vercel Blob store in your Vercel dashboard</li>
                <li>2. Copy the VITE_BLOB_READ_WRITE_TOKEN from the store settings</li>
                <li>3. Add it to your .env file and Vercel environment variables</li>
                <li>4. Restart your development server</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlobStorageTest;