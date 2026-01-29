import { NextResponse } from 'next/server';
import dealsData from '../../../public/deals-data.json';

export async function GET() {
  return NextResponse.json(dealsData);
}
