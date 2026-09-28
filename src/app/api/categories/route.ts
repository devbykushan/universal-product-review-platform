import { NextResponse } from 'next/server';
import { getCategories, saveCategory, updateCategoryMetrics } from '@/lib/db-service';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const saved = await saveCategory(body);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Error saving category:', error);
    return NextResponse.json({ error: 'Failed to save category' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { categoryId, metrics } = await req.json();
    const updated = await updateCategoryMetrics(categoryId, metrics);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating category metrics:', error);
    return NextResponse.json({ error: 'Failed to update category metrics' }, { status: 500 });
  }
}
