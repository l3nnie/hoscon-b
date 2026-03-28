import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function testImageUpload() {
  try {
    // Create a simple test image (1x1 pixel JPEG)
    const testImageBuffer = Buffer.from('ffd8ffe000104a46494600010101004800480000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffdb0043010909090c0b0c180d0d1832211c21323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232ffc00011080001000103012200021101031101ffc4001f00000105010101010101000000000000000000000000000102030405060708ffc4001510010100000000000000000000000000000000000000ffc4001411010000000000000000000000000000000000000000ffda000c03010002110311003f00', 'hex');

    const formData = new FormData();
    formData.append('image', testImageBuffer, {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg'
    });

    console.log('Sending test image upload...');
    console.log('Buffer length:', testImageBuffer.length);
    console.log('First 20 bytes (hex):', testImageBuffer.slice(0, 20).toString('hex'));

    const response = await fetch('http://localhost:5000/api/admin/upload-image', {
      method: 'POST',
      body: formData,
      headers: {
        // Add any auth headers if needed
        ...formData.getHeaders()
      }
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', result);

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testImageUpload();