import { spawn } from 'child_process';
import { NextResponse } from 'next/server';

// POST handler for the API route
export async function POST(req) {
  try {
    // Parsing the request body
    const body = await req.json();
    const { age, height, weight, sex, waistline } = body;

    // Validating input fields
    if (!age || !height || !weight || !sex || !waistline) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Spawn the Python script with required arguments
    const python = spawn('python', [
      './KNNModel.py',
      age.toString(),
      height.toString(),
      weight.toString(),
      sex.toString(),
      waistline.toString(),
    ]);

    let output = '';
    let errorOutput = '';

    // Capture standard output from Python script
    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Capture error output from Python script
    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Handle script closure and return response
    return new Promise((resolve) => {
      python.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python script exited with code ${code}: ${errorOutput}`);
          resolve(
            NextResponse.json(
              { message: `Error running Python script: ${errorOutput}` },
              { status: 500 }
            )
          );
        } else {
          resolve(NextResponse.json({ result: output.trim() }, { status: 200 }));
        }
      });
    });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
