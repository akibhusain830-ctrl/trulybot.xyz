import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/protectedRoute';
import { SecureKnowledgeAccess } from '@/lib/auth/secureKnowledgeAccess';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));

    let items;
    if (query) {
      // Search knowledge items
      items = await SecureKnowledgeAccess.searchKnowledge(authResult.userId, query, limit);
    } else {
      // Get all knowledge items for user
      items = await SecureKnowledgeAccess.getUserKnowledge(authResult.userId, limit);
    }

    return NextResponse.json({
      success: true,
      items,
      count: items.length
    });
    
  } catch (error) {
    console.error('Error fetching knowledge:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch knowledge'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { content, filename } = await req.json();
    
    if (!content || !filename) {
      return NextResponse.json({
        success: false,
        error: 'Content and filename are required'
      }, { status: 400 });
    }

    const item = await SecureKnowledgeAccess.addKnowledgeItem(
      authResult.userId,
      content,
      filename
    );

    return NextResponse.json({
      success: true,
      item
    });
    
  } catch (error) {
    console.error('Error adding knowledge:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add knowledge'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { itemId, content, filename } = await req.json();
    
    if (!itemId || !content || !filename) {
      return NextResponse.json({
        success: false,
        error: 'Item ID, content, and filename are required'
      }, { status: 400 });
    }

    const item = await SecureKnowledgeAccess.updateKnowledgeItem(
      authResult.userId,
      itemId,
      content,
      filename
    );

    return NextResponse.json({
      success: true,
      item
    });
    
  } catch (error) {
    console.error('Error updating knowledge:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update knowledge'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('id');
    
    if (!itemId) {
      return NextResponse.json({
        success: false,
        error: 'Item ID is required'
      }, { status: 400 });
    }

    await SecureKnowledgeAccess.deleteKnowledgeItem(authResult.userId, itemId);

    return NextResponse.json({
      success: true,
      message: 'Knowledge item deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting knowledge:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete knowledge'
    }, { status: 500 });
  }
}